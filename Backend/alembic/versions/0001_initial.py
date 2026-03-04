"""initial tables

Revision ID: 0001_initial
Revises: 
Create Date: 2026-03-02
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "url_checks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("url", sa.String(), index=True),
        sa.Column("flagged", sa.String(), nullable=False),
        sa.Column("reason", sa.String(), nullable=False),
        sa.Column("checked_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "message_checks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("flagged", sa.String(), nullable=False),
        sa.Column("reason", sa.String(), nullable=False),
        sa.Column("checked_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "report_contents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("reported_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "api_keys",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key_prefix", sa.String(length=12), nullable=False),
        sa.Column("key_hash", sa.String(length=255), nullable=False),
        sa.Column("owner_email", sa.String(length=255), nullable=False),
        sa.Column("plan", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_api_keys_key_prefix", "api_keys", ["key_prefix"], unique=False)
    op.create_index("ix_api_keys_owner_email", "api_keys", ["owner_email"], unique=False)

    op.create_table(
        "api_usage",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("api_key_id", sa.Integer(), sa.ForeignKey("api_keys.id"), nullable=False),
        sa.Column("endpoint", sa.String(length=255), nullable=False),
        sa.Column("method", sa.String(length=16), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("units", sa.Integer(), nullable=True),
        sa.Column("used_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_api_usage_api_key_id", "api_usage", ["api_key_id"], unique=False)
    op.create_index("ix_api_usage_used_at", "api_usage", ["used_at"], unique=False)


def downgrade():
    op.drop_index("ix_api_usage_used_at", table_name="api_usage")
    op.drop_index("ix_api_usage_api_key_id", table_name="api_usage")
    op.drop_table("api_usage")
    op.drop_index("ix_api_keys_owner_email", table_name="api_keys")
    op.drop_index("ix_api_keys_key_prefix", table_name="api_keys")
    op.drop_table("api_keys")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("report_contents")
    op.drop_table("message_checks")
    op.drop_table("url_checks")
