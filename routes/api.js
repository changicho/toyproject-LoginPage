var express = require('express');
var router = express.Router();

// low-db 추가
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

// SHA512 암호화 사용하기 위한 추가
const crypto = require('crypto');


/**
 * axios 테스트용 페이지
 */
router.get('/test', function (request, response, next) {
  response.render('axios_test');
});

// post 방식으로 온 데이터를 echo 하는 test URL
router.post('/check_data', function (request, response, next) {
  console.log('method : POST')
  console.log(request.body);
  response.send(request.body);
})

// get 방식으로 온 데이터를 echo 하는 test URL
router.get('/check_data', function (request, response, next) {
  console.log('method : GET')
  console.log(request.body);
  response.send(request.body);
})

/**
 * 로그인 시 비밀번호 확인
 * id 정보와 pw 정보 전부 왔을 경우에만 실행
 */
router.post('/check_confidentiality', function (request, response, next) {
  console.log(request.body);

  if (check_password(request.body.id, request.body.password)) {
    console.log('pass')
    // response.render('main');
    response.redirect('/')

  } else {
    console.log('fail')
  }
})

router.post('/store_account_data', function (request, response, next) {
  // push_data(makeAccount(request.body), 'accounts');
  response.redirect('/')
})


/**
 * 
 * @param {*} data  : DB에 저장하고 싶은 data
 * @param {*} table : DB의 저장하고 싶은 table 
 */
function push_data(data, table) {
  db.get(table)
    .push(data)
    .write()
}


/**
 * 
 * @param {*} requst_body : post로 넘어온 회원가입 정보를 DB에 저장할 수 있도록 가공해줌 
 */
function makeAccount(requst_body) {
  let password_sha512 = crypto.createHash('sha512').update(requst_body.password).digest('base64');

  return data = {
    "id": requst_body.id,
    "password": password_sha512,
    "name": requst_body.name,
    "birthdate": `${requst_body.year}.${requst_body.month}.${requst_body.day}`,
    "gender": requst_body.gender,
    "email": requst_body.email,
    "phone": requst_body.phone,
    "interest": requst_body.interests_string.split(', ')
  }
}

/**
 * 
 * @param {*} input_id 입력한 ID값
 * @param {*} input_password 입력한 password 값
 */
function check_password(input_id, input_password) {
  let input_password_sha512 = crypto.createHash('sha512').update(input_password).digest('base64');
  let target = db.get('accounts')
    .find({ id: input_id })
    .value()

  console.log(target.password)
  if (input_password_sha512 === target.password) {
    return true;
  }
  return false;
}

module.exports = router;