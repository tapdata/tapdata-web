## Customize character ordering
### The problem solved
- The validation will sort the data according to the associated field. If the default sorting rules of the source table and the target table are not consistent, the validation may fail because the data is not sorted in the same way, but the data is actually the same. In this case, you can set a custom sorting rule to make the source and destination data sorted in the same way and pass the data validation
### The problem
- Increased data pressure due to the inability to move the index when sorting with custom sorting rules
### Usage
- Select an association field that requires a custom ordering. It is important to note that the selected association field must support a custom ordering, such as NVARCHAR, NCHAR, etc. If you specify a field type that does not support custom sorting, such as an int type in SQL Server, the validation task will throw an error
- Choose one of the collations in the source database and the target database. The name of the collation may be different, but we need to choose the two collations to be consistent, so that we can solve the problem of unsuccessful verification due to inconsistent sorting
 