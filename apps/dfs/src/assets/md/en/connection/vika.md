## **Connection configuration help**

### **1. Vig table Restrictions**
When sending API requests, you need to be aware of two limitations: frequency limitations and usage limitations

Please follow the restrictions below to ensure successful addition and use of wiggle tables in Tapdata.

### **1.1 Frequency Limit**
The frequency of API requests from the same user to the same table is 5 times/second

When the request frequency exceeds the limit, it will prompt that the error operation is too frequent (error status code 429 )

### **1.2 Usage Limit**
There are two types of usage restrictions: one is API usage restrictions; the other is space station resource usage restrictions

Bronze-level and silver-level space stations can call the API 10,000 times for free each month, and the accumulated usage is cleared on the monthly billing date

During the beta phase, you can create a long 1000 Wiggles table. A single dimensional table to do more supports the creation of 50,000 rows of records, 200 fields, and 30 views

Attachments can be uploaded up to 1 GB on a single space station
