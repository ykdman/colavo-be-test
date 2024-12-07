## Description

- ColavoGround 콜라보살롱 유사 API 구현 테스트

## Project Setting

- Nest.js (v10.0.0)
- npm (v10.5.0)
- node (v20.12.2)

### install dependencies

```bash
npm install
```

### node setting

```bash
nvm install
```

```bash
nvm use
```

### Run Project

```bash
npm run start
```

## Run API

- method : `POST`
- url : `/gettimeslots`
- Example Request Data
- [TZ Data](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

  ```json
  {
    "start_day_identifier": "20210910",
    "days": 2,
    "service_duration": 600,
    "timeslot_interval": 1800,
    "is_ignore_schedule": false,
    "is_ignore_workhour": true,
    "timezone_identifier": "Asia/Seoul"
  }
  ```

- Example Response Data Type

  ```json
  [
    {
      "start_of_day": number,
      "day_modifier": number,
      "is_day_off": boolean,
      "timeslots": [
        {
          "begin_at": number,
          "end_at": number
        }
      ]
    }
  ]
  ```
