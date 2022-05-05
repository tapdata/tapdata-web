##### Advanced Verification Instructions
**The first step** The function input parameter is the source table data, you can call the **built-in function** according to the source table data to query the target data<br>
**Step 2** Custom verification logic<br>
**Step 3** The function returns the result<br>

- **result**: whether the verification is passed (passed: verification passed, failed: verification failed), if no or other characters are filled in, the verification fails, required <br>
- **message**: verification exception information, it is recommended to return if verification fails, optional<br>
- **data**: current verification target data, it is recommended to return if verification fails, optional<br>


Full Example: This is an example MongoDB query
````javascript
function validate(sourceRow){
    // step 1
     var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // step 2
     if(sourceRow.USER_ID === targetRow[0].USER_ID){
      // step 3
         return {result: 'passed',message: "",data: ""}
     }else{
        return {result: 'failed', message: "Inconsistent records", data: targetRow}
    }
}
````
