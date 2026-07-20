from django.db import migrations, models
from django.utils import timezone


def add_last_rotation_if_missing(apps, schema_editor):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if "last_rotation" in existing_columns:
        return

    field = models.DateTimeField(default=timezone.now)
    field.set_attributes_from_name("last_rotation")
    schema_editor.add_field(Auditor, field)


def remove_last_rotation_if_present(apps, schema_editor):
    Auditor = apps.get_model("documents", "Auditor")
    table_name = Auditor._meta.db_table
    existing_columns = {
        column.name for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    if "last_rotation" not in existing_columns:
        return

    field = Auditor._meta.get_field("last_rotation")
    schema_editor.remove_field(Auditor, field)


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0008_merge_20260717_0001"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_last_rotation_if_missing,
                    remove_last_rotation_if_present,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="auditor",
                    name="last_rotation",
                    field=models.DateTimeField(default=timezone.now),
                ),
            ],
        ),
    ]
