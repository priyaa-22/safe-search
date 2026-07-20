from django.db import migrations, models


def add_organization_name_if_missing(apps, schema_editor):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if "organization_name" in existing_columns:
        return

    field = models.CharField(default="", max_length=255)
    field.set_attributes_from_name("organization_name")
    schema_editor.add_field(Auditor, field)


def remove_organization_name_if_present(apps, schema_editor):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if "organization_name" not in existing_columns:
        return

    field = Auditor._meta.get_field("organization_name")
    schema_editor.remove_field(Auditor, field)


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0010_sync_organization_code_field"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_organization_name_if_missing,
                    remove_organization_name_if_present,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="auditor",
                    name="organization_name",
                    field=models.CharField(default="", max_length=255),
                ),
            ],
        ),
    ]
