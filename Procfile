web: npm start
dbms: docker run --network=api-network -e DB_HOST=dbms -e DB_PORT=3306 -e DB_USER=myuser -e DB_PASSWORD=mypassword mycli -h dbms -u root < /dbms/ddl/init.sql mycli -h dbms -u root < /dbms/ddl/ddl.sql
