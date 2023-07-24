# Getting start

## booster server

로컬 , 개발서버 구성 , k8s 구성 , DB 구조 설계 팀원없이 혼자 구성하고 개발했습니다.  
*.yml 파일은 deployment와 ingress입니다.  

### Requirements

```bash
touch .env
# Fcm
touch /nest/src/service-account.json
touch /nest2/src/service-account.json
touch /admin/src/service-account.json
touch /socket/src/service-account.json
touch /scheduler/src/service-account.json
```

* docker-compose up --build
  * swagger 문서 = http://localhost:8000/docs/
  * nest baseurl = http://localhost/nest/
  * swagger 문서 = http://localhost:8002/docs/
  * nest2 baseurl = http://localhost/nest2/
  * swagger 문서 = http://localhost:8080/swagger-ui.html
  * auth baseurl = http://localhost/auth/
  * swagger 문서 = http://localhost:5555/docs/
  * admin baseurl = http://localhost/admin/
  * swagger 문서 = http://localhost:8003/docs/
  * hellofintech baseurl = http://localhost/open/hellofin
