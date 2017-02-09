FROM java:8

COPY . deck/

WORKDIR deck

RUN docker/setup-apache2.sh && \
  GRADLE_USER_HOME=cache ./gradlew build -PskipTests && \
  mkdir -p /opt/deck/html/ && \
  mkdir -p /docker/ && \
  cp build/webpack/* /opt/deck/html/ && \
  cp docker/* /docker/ && \
  cd .. && \
  rm -rf deck/* && \
  mv /docker/ /deck/

CMD /opt/deck/docker/run-apache2.sh
