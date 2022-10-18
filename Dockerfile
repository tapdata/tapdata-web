#
# Build image
#  - Run command `docker build -t cloud/console:v1 .` in directory tapdata-enterprise-web
# Usage image
#  - Parameter USER_ID: Specify the identity of the user, all operations of the user on the console are performed by the identity of this user.
#  - Parameter SERVER_URI: Gateway server uri.
#  - Run command `docker run -it --rm -e SERVER_URI=http://172.31.119.19:30104 -e USER_ID=60c06045e18eaf41b9d1ff3e -p 18080:8080 cloud/console:v1` to start container.
#

FROM node:16.18.0

WORKDIR /opt/web
COPY . /opt/web/

RUN cd /opt/web && \
    npm i -g pnpm && \
    pnpm i

EXPOSE 8080/tcp
ENV SERVE_ENV=PROD

CMD ["pnpm", "start:dfs"]
