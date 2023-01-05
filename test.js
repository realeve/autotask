

let f = `item=>{
    if (item.company == 'company') {
        console.log(item.user);
    }
}
`
var fun = eval(f);

console.log(fun)

fun({ company: 'company', user: 23 })
fun({ company: 'compandsdy', user: 22223 })