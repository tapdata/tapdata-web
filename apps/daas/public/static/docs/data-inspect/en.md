## TimeUpdate

### $dynamicDate

#### **_Function Description_**

The time parameter in the filtering conditions of the verification task is automatically updated according to the
configuration, and currently this function only supports Mongo. The parameters included in the attribute modification
include:

- customFormat: String type, non mandatory, time format string that needs to be automatically converted, can be
  dynamically combined with placeholders, time format requires standard date format: yyyy-MM-dd HH:mm:ss.SSS, defaults
  to the current time the task runs
- subtract: Integer type (in milliseconds), non mandatory, positive numbers represent the number of milliseconds of time
  reduced based on the format value
- toStringFormat: String type, time output format, non mandatory, semantic is whether to output the final result as a
  time format string, for example: value is: yyyy-MM-dd hh:mm:ss, Then output the time string in this format. If the
  value is null or not filled in, it means that the output is a time date object equivalent to $date

#### Case reference

1. Fixed time

```json
{
  "field": {
    "$gt": {
      "$dynamicDate": {
        "customFormat": "2023-03-19 05:00:00.000",
        "subtract": 3600000
      }
    }
  }
}
```

The meaning of the above filtering conditions is: query all records whose field time is greater than "2023-03-19 04:00:
00", with a time of "2023-03-19 05:00:00" in the configuration, and a time reduction span of 3600000

2. Dynamic Days

```json
{
  "field": {
    "$gt": {
      "$dynamicDate": {
        "customFormat": "yyyy-MM-dd 00:00:00.000",
        "subtract": 86400000
      }
    }
  }
}
```

The meaning of the above filtering conditions is: query all records after 0:00 in the field time one day before the
start of each task, with a configured time of "yyyy MM dd 00:00:00" and a time reduction span of 86400000. YYYY is a
year placeholder that uses the year of task start time. MM is a month placeholder, using the month when the task is
initiated, and so on. The supported placeholders include dd, hh, mm, ss, and SSS

3. Output string format
   If the field type in your table is string, you need to query data with a field greater than one day ago every day.
   You can use the following filtering conditions:

```json
{
  "field": {
    "$gt": {
      "$dynamicDate": {
        "customFormat": "yyyy-MM-dd 00:00:00.000",
        "subtract": 86400000,
        "toStringFormat": "yyyy-MM-dd HH:mm:ss"
      }
    }
  }
}
```
