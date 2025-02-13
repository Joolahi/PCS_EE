from App import create_app

# Change "development" to "production" for production environments
app = create_app(config_name="development")

if __name__ == "__main__":
    app.run()
