class ChromeProfileException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class WebDriverException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class LoginException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class IDException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class InvalidCookies(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)