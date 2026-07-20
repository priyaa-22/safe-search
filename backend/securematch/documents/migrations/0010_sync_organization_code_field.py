from django.db import migrations, models


def add_organization_code_if_missing(apps, schema_editor):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if "organization_code" in existing_columns:
        return

    field = models.CharField(default="", max_length=64)
    field.set_attributes_from_name("organization_code")
    schema_editor.add_field(Auditor, field)


def remove_organization_code_if_present(apps, schema_editor):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if "organization_code" not in existing_columns:
        return

    field = Auditor._meta.get_field("organization_code")
    schema_editor.remove_field(Auditor, field)


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0009_sync_last_rotation_field"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_organization_code_if_missing,
                    remove_organization_code_if_present,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="auditor",
                    name="organization_code",
                    field=models.CharField(default="", max_length=64),
                ),
            ],
        ),
    ]
