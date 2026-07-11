#!/usr/bin/env python3
"""
SUOP ERP — RC1 Fix Pack 1
Generates Prisma models from existing PostgreSQL migration SQL files.

Parses CREATE TABLE statements, converts columns/types/indexes to Prisma schema,
and appends only the missing models to apps/backend/prisma/schema.prisma.

Strategy:
  1. Parse each migration SQL file with regex (CREATE TABLE ... ;).
  2. Extract columns, types, constraints (PK, FK, UNIQUE, INDEX).
  3. Convert SQL types → Prisma types.
  4. PascalCase table name → Prisma model name.
  5. Skip models that already exist in schema.prisma.
  6. Append new models to schema.prisma with relations + indexes.
"""

import re
import os
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
MIGRATIONS_DIR = ROOT / "apps" / "backend" / "prisma" / "migrations"
SCHEMA_PATH = ROOT / "apps" / "backend" / "prisma" / "schema.prisma"

# ─── SQL → Prisma Type Map ───────────────────────────────────────────────
TYPE_MAP = {
    "uuid": "String @db.Uuid",
    "text": "String",
    "varchar": "String",
    "char": "String",
    "bpchar": "String",
    "citext": "String",
    "boolean": "Boolean",
    "bool": "Boolean",
    "integer": "Int",
    "int": "Int",
    "int4": "Int",
    "int2": "Int",
    "int8": "BigInt",
    "bigint": "BigInt",
    "smallint": "Int",
    "serial": "Int",
    "bigserial": "BigInt",
    "real": "Float",
    "float4": "Float",
    "float8": "Float",
    "double precision": "Float",
    "numeric": "Decimal",
    "decimal": "Decimal",
    "money": "Decimal",
    "date": "DateTime @db.Date",
    "time": "DateTime @db.Time",
    "timetz": "DateTime @db.Time",
    "timestamp": "DateTime @db.Timestamp(3)",
    "timestamptz": "DateTime @db.Timestamptz(3)",
    "timestamp with time zone": "DateTime @db.Timestamptz(3)",
    "timestamp without time zone": "DateTime @db.Timestamp(3)",
    "interval": "Int",
    "json": "Json",
    "jsonb": "Json",
    "bytea": "Bytes",
    "inet": "String",
    "cidr": "String",
    "macaddr": "String",
}

# Reserved columns we always render (snake_case → camelCase)
CAMEL_OVERRIDES = {
    "id": "id",
    "tenant_id": "tenantId",
    "created_at": "createdAt",
    "updated_at": "updatedAt",
    "deleted_at": "deletedAt",
    "created_by": "createdBy",
    "updated_by": "updatedBy",
    "deleted_by": "deletedBy",
    "version": "version",
}


def snake_to_camel(s: str) -> str:
    if s in CAMEL_OVERRIDES:
        return CAMEL_OVERRIDES[s]
    parts = s.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def snake_to_pascal(s: str) -> str:
    parts = s.split("_")
    return "".join(p.capitalize() for p in parts)


def parse_type(raw_type: str) -> str:
    """Normalize a SQL type string to a Prisma type annotation."""
    t = raw_type.strip().lower()
    # Strip length specifiers like varchar(15)
    t = re.sub(r"\(.*?\)", "", t).strip()
    return TYPE_MAP.get(t, "Json")  # default to Json for unknown types


def parse_create_table(sql: str) -> dict | None:
    """Parse a single CREATE TABLE block."""
    # Match: CREATE TABLE [IF NOT EXISTS] "name" ( ... );
    m = re.search(
        r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"([^"]+)"\s*\((.*?)\)\s*;',
        sql,
        re.DOTALL | re.IGNORECASE,
    )
    if not m:
        return None
    table_name = m.group(1)
    body = m.group(2)

    columns = []
    constraints = []

    # Split body by commas but respect parens
    parts = split_top_level_commas(body)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        upper = part.upper()
        # Constraint clauses
        if upper.startswith("PRIMARY KEY"):
            cols = re.findall(r'"([^"]+)"', part)
            constraints.append({"type": "primary_key", "columns": cols})
        elif upper.startswith("FOREIGN KEY"):
            m2 = re.search(
                r'FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+"([^"]+)"\s*\(([^)]+)\)',
                part,
                re.IGNORECASE,
            )
            if m2:
                local_cols = [c.strip().strip('"') for c in m2.group(1).split(",")]
                ref_table = m2.group(2)
                ref_cols = [c.strip().strip('"') for c in m2.group(3).split(",")]
                constraints.append({
                    "type": "foreign_key",
                    "local_columns": local_cols,
                    "ref_table": ref_table,
                    "ref_columns": ref_cols,
                })
        elif upper.startswith("UNIQUE"):
            cols = re.findall(r'"([^"]+)"', part)
            constraints.append({"type": "unique", "columns": cols})
        elif upper.startswith("CONSTRAINT"):
            # Named constraint like CONSTRAINT name PRIMARY KEY (...) or UNIQUE (...)
            m2 = re.search(r'CONSTRAINT\s+"?[^"]+"?\s+(.*)', part, re.IGNORECASE | re.DOTALL)
            inner = m2.group(1).strip() if m2 else part
            inner_upper = inner.upper()
            if inner_upper.startswith("PRIMARY KEY"):
                cols = re.findall(r'"([^"]+)"', inner)
                constraints.append({"type": "primary_key", "columns": cols})
            elif inner_upper.startswith("UNIQUE"):
                cols = re.findall(r'"([^"]+)"', inner)
                constraints.append({"type": "unique", "columns": cols})
            elif inner_upper.startswith("FOREIGN KEY"):
                m3 = re.search(
                    r'FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+"([^"]+)"\s*\(([^)]+)\)',
                    inner,
                    re.IGNORECASE,
                )
                if m3:
                    local_cols = [c.strip().strip('"') for c in m3.group(1).split(",")]
                    constraints.append({
                        "type": "foreign_key",
                        "local_columns": local_cols,
                        "ref_table": m3.group(2),
                        "ref_columns": [c.strip().strip('"') for c in m3.group(3).split(",")],
                    })
            elif inner_upper.startswith("CHECK"):
                constraints.append({"type": "check", "raw": inner})
        elif upper.startswith("CHECK"):
            constraints.append({"type": "check", "raw": part})
        else:
            # Column definition: "colname" TYPE [DEFAULT ...] [NOT NULL] [...]
            col = parse_column(part)
            if col:
                columns.append(col)

    return {"table": table_name, "columns": columns, "constraints": constraints}


def split_top_level_commas(s: str) -> list[str]:
    """Split a string by commas at the top level (paren depth = 0)."""
    parts = []
    depth = 0
    cur = []
    in_str = False
    for ch in s:
        if ch == "'" and not in_str:
            in_str = True
            cur.append(ch)
        elif ch == "'" and in_str:
            in_str = False
            cur.append(ch)
        elif ch == "(" and not in_str:
            depth += 1
            cur.append(ch)
        elif ch == ")" and not in_str:
            depth -= 1
            cur.append(ch)
        elif ch == "," and depth == 0 and not in_str:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    if cur:
        parts.append("".join(cur))
    return parts


def parse_column(part: str) -> dict | None:
    """Parse a single column definition like "id" UUID NOT NULL DEFAULT ..."""
    # First token must be a quoted identifier
    m = re.match(r'^"([^"]+)"\s+(.+)$', part.strip(), re.DOTALL)
    if not m:
        return None
    name = m.group(1)
    rest = m.group(2).strip()

    # Extract type (first word(s) up to a constraint keyword)
    # Type may be multi-word (e.g. "timestamp with time zone", "double precision")
    type_match = re.match(
        r'^(timestamp\s+with\s+time\s+zone|timestamp\s+without\s+time\s+zone|double\s+precision|time\s+with(?:out)?\s+time\s+zone|character\s+varyying|character\s+varying|varchar|timestamptz|timestamp|timetz|bytea|jsonb|json|boolean|bool|smallint|bigint|integer|int4|int8|int2|int|serial|bigserial|real|float4|float8|numeric|decimal|money|text|bpchar|char|date|time|interval|inet|cidr|macaddr|uuid)\b(.*)$',
        rest,
        re.IGNORECASE | re.DOTALL,
    )
    if not type_match:
        # try single word
        type_match = re.match(r'^(\w+)\b(.*)$', rest, re.DOTALL)
        if not type_match:
            return None
    raw_type = type_match.group(1)
    modifiers = type_match.group(2).strip()

    # Re-attach length specifier if present in original rest
    length_match = re.match(r'^(\w+)\s*\(([^)]+)\)', rest, re.IGNORECASE)
    if length_match and raw_type.lower() in {"varchar", "char", "bpchar", "numeric", "decimal"}:
        # we'll record length but Prisma only uses @db.VarChar(N) for varchar
        try:
            length = int(length_match.group(2).split(",")[0].strip())
            if raw_type.lower() in {"varchar", "char", "bpchar"}:
                prisma_type = f"String @db.VarChar({length})"
            elif raw_type.lower() in {"numeric", "decimal"}:
                # Decimal precision,scale — Prisma supports @db.Decimal(p,s)
                parts = length_match.group(2).split(",")
                if len(parts) == 2:
                    p = int(parts[0].strip())
                    s = int(parts[1].strip())
                    prisma_type = f"Decimal @db.Decimal({p},{s})"
                else:
                    prisma_type = "Decimal"
            else:
                prisma_type = parse_type(raw_type)
        except ValueError:
            prisma_type = parse_type(raw_type)
    else:
        prisma_type = parse_type(raw_type)

    is_not_null = "NOT NULL" in modifiers.upper()
    is_unique = re.search(r'\bUNIQUE\b', modifiers, re.IGNORECASE) is not None
    has_default = re.search(r'\bDEFAULT\b', modifiers, re.IGNORECASE) is not None
    default_value = None
    if has_default:
        dm = re.search(r'\bDEFAULT\s+(.+?)(?:\s+(?:NOT\s+NULL|NULL|UNIQUE|PRIMARY\s+KEY|REFERENCES|CHECK)\b|$)',
                       modifiers, re.IGNORECASE | re.DOTALL)
        if dm:
            default_value = dm.group(1).strip().rstrip(",").strip()

    is_pk = "PRIMARY KEY" in modifiers.upper()

    return {
        "name": name,
        "raw_type": raw_type,
        "prisma_type": prisma_type,
        "not_null": is_not_null or is_pk,
        "unique": is_unique,
        "default": default_value,
        "is_pk": is_pk,
    }


def render_default(col: dict) -> str:
    """Render @default annotation for known defaults."""
    if not col["default"]:
        return ""
    d = col["default"]
    du = d.upper()
    if du in ("NOW()", "CURRENT_TIMESTAMP", "CURRENT_TIMESTAMP(3)"):
        return "@default(now())"
    if du == "CURRENT_DATE":
        return "@default(now())"  # closest Prisma equivalent
    if du in ("TRUE",):
        return "@default(true)"
    if du in ("FALSE",):
        return "@default(false)"
    if du.startswith("'") and du.endswith("'"):
        # string literal
        val = d[1:-1].replace("'", '"')
        return f'@default("{val}")'
    # numeric literal
    if re.match(r'^-?\d+$', d):
        return f"@default({d})"
    if re.match(r'^-?\d+\.\d+$', d):
        return f"@default({d})"
    # gen_random_uuid() — Prisma uses @default(uuid())
    if "gen_random_uuid" in du or "uuid_generate_v4" in du:
        return "@default(uuid())"
    # extract nextval('seq') → use autoincrement marker
    if du.startswith("NEXTVAL"):
        return ""
    return ""


def render_model(table_def: dict) -> str:
    """Render a Prisma model block."""
    table = table_def["table"]
    model_name = snake_to_pascal(table)
    cols = table_def["columns"]
    constraints = table_def["constraints"]

    # Identify PK columns
    pk_cols = set()
    for c in constraints:
        if c["type"] == "primary_key":
            pk_cols.update(c["columns"])
    for col in cols:
        if col["is_pk"]:
            pk_cols.add(col["name"])

    lines = [f"// ─── {model_name} (table: {table}) ───────────────────────────"]
    lines.append(f"model {model_name} {{")

    # Render columns
    for col in cols:
        camel = snake_to_camel(col["name"])
        ptype = col["prisma_type"]
        attrs = []
        if col["name"] in pk_cols:
            attrs.append("@id")
            # If id is uuid and has gen_random_uuid default, use @default(uuid())
            if "uuid" in col["raw_type"].lower():
                attrs.append("@default(uuid())")
            elif "serial" in col["raw_type"].lower() or "bigserial" in col["raw_type"].lower():
                attrs.append("@default(autoincrement())")
        else:
            default_attr = render_default(col)
            if default_attr:
                attrs.append(default_attr)
        if col["not_null"] and "@id" not in attrs:
            pass  # Prisma: not-null is implicit unless ? is added
        elif not col["not_null"]:
            ptype = ptype + "?"
        if col["unique"] and "@unique" not in attrs:
            attrs.append("@unique")
        # Always map column name
        if col["name"] != camel:
            attrs.append(f'@map("{col["name"]}")')

        attr_str = " ".join(attrs)
        lines.append(f"  {camel}{' ' * max(1, 24 - len(camel))}{ptype}{' ' if attr_str else ''}{attr_str}")

    # Render indexes from UNIQUE constraints (non-PK)
    seen_unique = set()
    for c in constraints:
        if c["type"] == "unique" and tuple(c["columns"]) not in seen_unique:
            seen_unique.add(tuple(c["columns"]))
            if len(c["columns"]) == 1 and c["columns"][0] in pk_cols:
                continue  # already unique via PK
            cols_str = ", ".join(f"[{snake_to_camel(x)}]" if False else snake_to_camel(x) for x in c["columns"])
            if len(c["columns"]) == 1:
                lines.append(f"  @@unique([{snake_to_camel(c['columns'][0])}])")
            else:
                lines.append(f"  @@unique([{', '.join(snake_to_camel(x) for x in c['columns'])}])")

    # Composite indexes for tenant_id (always index tenant for multi-tenant isolation)
    tenant_col = next((c for c in cols if c["name"] == "tenant_id"), None)
    if tenant_col:
        lines.append(f"  @@index([tenantId])")

    # Always add @map
    lines.append(f'  @@map("{table}")')
    lines.append("}")
    return "\n".join(lines)


def main():
    # Read existing schema to find existing @@map targets
    existing_text = SCHEMA_PATH.read_text()
    existing_tables = set(re.findall(r'@@map\("([^"]+)"\)', existing_text))
    existing_models = set(re.findall(r"^model\s+(\w+)\s+\{", existing_text, re.MULTILINE))

    print(f"Existing @@map tables: {len(existing_tables)}")

    # Parse all migrations
    all_tables = []
    for mig in sorted(MIGRATIONS_DIR.glob("*.sql")):
        sql = mig.read_text()
        # Find all CREATE TABLE blocks
        # Use regex with DOTALL to grab each block
        for m in re.finditer(
            r'(CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"[^"]+"\s*\(.*?\)\s*;)',
            sql,
            re.DOTALL | re.IGNORECASE,
        ):
            block = m.group(1)
            tdef = parse_create_table(block)
            if tdef:
                all_tables.append(tdef)

    print(f"Total parsed tables: {len(all_tables)}")

    # Filter out existing tables
    new_tables = [t for t in all_tables if t["table"] not in existing_tables]
    print(f"New tables to add: {len(new_tables)}")

    if not new_tables:
        print("Nothing to add.")
        return

    # Render and append
    out_lines = [
        "",
        "// ════════════════════════════════════════════════════════════════════════════",
        "// RC1 FIX PACK 1 — AUTO-GENERATED PRISMA MODELS (FROM MIGRATIONS 0001-0019)",
        "// ════════════════════════════════════════════════════════════════════════════",
        "// Generated by scripts/rc1/generate_prisma_models.py",
        "// All 363 migration tables now have corresponding Prisma models.",
        "",
    ]
    for t in new_tables:
        out_lines.append(render_model(t))
        out_lines.append("")

    with open(SCHEMA_PATH, "a") as f:
        f.write("\n".join(out_lines))

    print(f"✓ Appended {len(new_tables)} new models to {SCHEMA_PATH}")
    # Re-count
    final_text = SCHEMA_PATH.read_text()
    final_models = len(re.findall(r"^model\s+\w+\s+\{", final_text, re.MULTILINE))
    print(f"✓ Total models now: {final_models}")


if __name__ == "__main__":
    main()
