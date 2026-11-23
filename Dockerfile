FROM php:8.2-apache

# Enable Apache rewrite and headers modules
RUN a2enmod rewrite headers

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    sqlite3 \
    libpq-dev \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql pdo_pgsql

# Configure Apache Document Root to backend/public and enable .htaccess
ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html
COPY . .

# Ensure database directory is writable for SQLite
RUN chown -R www-data:www-data /var/www/html/backend/database && chmod -R 777 /var/www/html/backend/database

EXPOSE 80
CMD ["apache2-foreground"]
