from django.db import migrations, models


def add_field_if_missing(apps, schema_editor, field_name, field):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if field_name in existing_columns:
        return

    field.set_attributes_from_name(field_name)
    schema_editor.add_field(Auditor, field)


def remove_field_if_present(apps, schema_editor, field_name):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if field_name not in existing_columns:
        return

    field = Auditor._meta.get_field(field_name)
    schema_editor.remove_field(Auditor, field)


def add_legacy_credential_fields(apps, schema_editor):
    add_field_if_missing(apps, schema_editor, "username", models.CharField(default="", max_length=255))
    add_field_if_missing(apps, schema_editor, "temp_password", models.CharField(default="", max_length=255))


def remove_legacy_credential_fields(apps, schema_editor):
    remove_field_if_present(apps, schema_editor, "temp_password")
    remove_field_if_present(apps, schema_editor, "username")


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0011_sync_organization_name_field"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_legacy_credential_fields,
                    remove_legacy_credential_fields,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="auditor",
                    name="username",
                    field=models.CharField(blank=True, max_length=255, null=True),
                ),
                migrations.AddField(
                    model_name="auditor",
                    name="temp_password",
                    field=models.CharField(blank=True, max_length=255, null=True),
                ),
            ],
        ),
    ]
