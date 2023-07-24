FROM gradle:6.9-jdk11

WORKDIR /usr/src/auth
COPY . /usr/src/auth
VOLUME /tmp

RUN chmod +x run.sh && gradle getDeps

EXPOSE 8080

CMD [ "sh" , "run.sh" ]