from django.apps import AppConfig
class UsersConfig(AppConfig):
    name = 'users'


    def ready(self):
        import users.signals  # Ensure signals are imported when the app is ready
