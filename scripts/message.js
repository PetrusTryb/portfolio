var messages={
    "badrequest":"<string type='gui'>Failed to create account, try again</string>",
    "error":"<string type='gui'>Internal server error, sorry</string>",
    "registered":"<string type='gui'>Success! You can now log in.</string>",
    "exists":"<string type='gui'>User with that e-mail already exists.</string>",
    "denied":"<string type='gui'>Incorrect e-mail or password.</string>"
}
if(document.location.search.includes("message")){
    let msg=document.location.search.replace("?message=","");
    document.getElementById("msgb").parentElement.classList.remove("is-hidden");
    document.getElementById("msgb").innerHTML=messages[msg];
}
else{
    document.getElementById("msgb").parentElement.classList.add("is-hidden");
}