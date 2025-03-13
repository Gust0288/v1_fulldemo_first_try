function cl(message){
    console.log(message)
}

try{
    history.replaceState({"mixonurl":mix_replace_url}, "title", mix_replace_url)
}catch(err){
    cl(`Single Page App not possible, since mix_replace_url not set`)
}


// ##############################
function mixonurl(mix_url, push_to_history = true){
    // cl(`mixonurl(xurl): ${mix_url}`)
    
    document.querySelectorAll(`[mix-on-url='${mix_url}']`).forEach( el => {
        // cl(el)
        const title = el.getAttribute("mix-title") || false
        // console.log(`ok : x() the xTitle is '${title}'`)
        if(title){ document.title = title}   

        if(el.getAttribute("mix-push-url") && push_to_history){
            cl("Pushing to history")
            // cl(el.dataset.xpushurl)
            history.pushState({"mixonurl":el.getAttribute("mix-push-url")}, "", el.getAttribute("mix-push-url"))
            // history.replaceState({"xonurl":el.dataset.xseturl}, "title", el.dataset.xseturl)
        }

        if(el.getAttribute("mix-hide")){
            // document.querySelector(el.dataset.xhide).classList.add("hidden")        
            document.querySelectorAll(el.getAttribute("mix-hide")).forEach( i => {
                // cl(`hidding element: ${el.getAttribute("mix-hide")}`) 
                // cl(i)               
                // i.classList.add("hidden")
                i.style.display = "none"
            })
        }
        if(el.getAttribute("mix-show")){
            document.querySelectorAll(el.getAttribute("mix-show")).forEach( i => {
                // i.classList.remove("hidden")
                i.style.display = "block"
            })
        }            
    })
}


// ##############################
window.onpopstate = function(event){
    cl(`##### onpopstate`)
    cl(event.state.mixonurl)
    mixonurl(event.state.mixonurl, false)
}


// ##############################
function mix_convert(){
    try{
        document.querySelectorAll("[mix-get], [mix-post], [mix-put], [mix-patch], [mix-delete], [mix-ttl]").forEach( el => {
            
            if( el.hasAttribute("mix-ttl") ){
                console.log("ttl")
                const ttl = el.getAttribute("mix-ttl")
                if( ! /^[1-9]\d*$/.test(ttl) ){
                    console.log("mix-ttl must be an integer starting from 1")
                }else{
                    setTimeout(()=>{ el.remove() }, ttl)
                }
            }
            
            let el_method = ""
            cl(el)
            if( el.hasAttribute("mix-get") ){ el_method = "mix-get" }
            if( el.hasAttribute("mix-post") ){ el_method = "mix-post" }
            if( el.hasAttribute("mix-put") ){ el_method = "mix-put" }
            if( el.hasAttribute("mix-patch") ){ el_method = "mix-patch" }
            if( el.hasAttribute("mix-delete") ){ el_method = "mix-delete" }
            if(el instanceof HTMLFormElement){
                if( el.hasAttribute("action") ){
                    cl("form")
                    el.setAttribute(el_method, el.getAttribute("action"))
                }
                el.setAttribute("onsubmit", "mixhtml(); return false")
                return
            }
            if(el instanceof HTMLAnchorElement){
                if( el.hasAttribute("href") ){
                    cl("anchor")
                    el.setAttribute(el_method, el.getAttribute("href"))
                }
                el.setAttribute("onclick", "mixhtml(); return false")
                return
            }

            let el_event = "onclick"
            if( el.hasAttribute("mix-focus") ){ 
                el.removeAttribute("mix-focus")
                el_event = "onfocus"
            }
            if( el.hasAttribute("mix-blur") ){ 
                el.removeAttribute("mix-blur")
                el_event = "onblur"
            }
            el.setAttribute(el_event, "mixhtml(); return false")
            

        })
    }catch(error){
        cl(error)
    }
}





// ##############################
async function mixhtml(el=false){
    try
    {
        if( !el ){
            el = event.target
        }        

        let url = ""
        if( el.hasAttribute("mix-get") ){ url = el.getAttribute("mix-get") }
        if( el.hasAttribute("mix-post") ){ url = el.getAttribute("mix-post") }
        if( el.hasAttribute("mix-put") ){ url = el.getAttribute("mix-put") }
        if( el.hasAttribute("mix-patch") ){ url = el.getAttribute("mix-patch") }
        if( el.hasAttribute("mix-delete") ){ url = el.getAttribute("mix-delete") }
        if(url == ""){ cl(`mix-method missing, therefore url not found`); return }
        cl(`url: ${url}`)

        if( document.querySelector(`[mix-on-url="${url}"]`) ){
            cl("SPA already loaded, showing elements")
            mixonurl(url)
            return
        }

        mix_fetch_data(el)
    }
    catch(error)
    {
        cl(error)
    }
}


// ##############################
async function mix_fetch_data(el){
    

    let method = ""
    if( el.hasAttribute("mix-get") ){ method = "get" }
    if( el.hasAttribute("mix-post") ){ method = "post" }
    if( el.hasAttribute("mix-put") ){ method = "put" }
    if( el.hasAttribute("mix-patch") ){ method = "patch" }
    if( el.hasAttribute("mix-delete") ){ method = "delete" }

    // cl(`ok : mix_fetch_data() method to fetch data is ${el.getAttribute("mix-method")}`)   
    let url = el.getAttribute("mix-"+method).includes("?") ? `${el.getAttribute("mix-"+method)}&spa=yes` : `${el.getAttribute("mix-"+method)}?spa=yes` 
    
    // cl("url: " + url)

    if(method == "post" || method == "put" || method == "patch"){
        // if( ! el.getAttribute("mix-data") ){cl(`error : mix_fetch_data() mix-data missing`); return}
        // if( ! document.querySelector(el.getAttribute("mix-data")) ){cl(`error - mix-data element doesn't exist`); return} 
        // const frm = document.querySelector(el.getAttribute("mix-data"))
        // Validation inside each element of the form
        let errors = false
        const attrs = el.querySelectorAll("[mix-check]")
        for(let i = 0; i < attrs.length; i++){
            attrs[i].classList.remove("mix-error") 
            // const regex = "^"+attrs[i].getAttribute("mix-check")+"$"
            const regex = attrs[i].getAttribute("mix-check")
            re = new RegExp(regex)
            cl(re.test(attrs[i].value))
            if( ! re.test(attrs[i].value) ){
                cl("mix-check failed")
                attrs[i].classList.add("mix-error") 
                errors = true
            }
        }  
        if(errors) return
    }   
    
    if(el.getAttribute("mix-await")){
        el.disabled = true
        el.innerHTML = el.getAttribute("mix-await")
    }    

    if(el.getAttribute("mix-wait")){
        el.classList.add("mix-hidden")
        document.querySelector(el.getAttribute("mix-wait")).classList.remove("mix-hidden")
    }
    let conn = null
    if( ["post", "put", "patch"].includes(method) ){
        conn = await fetch(url, {
            method : method,
            body : el.tagName === "FORM" ? new FormData( el ) : null
        })        
    }else{   
        conn = await fetch(url, {
            method : method
        })
    }

    if(el.getAttribute("mix-await")){
        el.disabled = false
        el.innerHTML = el.getAttribute("mix-default")
    }    

    if(el.getAttribute("mix-wait")){
        el.classList.remove("mix-hidden")
        document.querySelector(el.getAttribute("mix-wait")).classList.add("mix-hidden")
    }    

    res = await conn.text()
    document.querySelector("body").insertAdjacentHTML('beforeend', res)
    process_template(el.getAttribute("mix-"+method))
}



// ##############################
function process_template(mix_url){
    try{    
        cl(`process_template() mix-url ${mix_url}`) 

        let new_url = false 
        
        if( document.querySelector("template[mix-redirect]") ){ 
            cl(`mix-redirect found`)
            location.href= document.querySelector("template[mix-redirect]").getAttribute("mix-redirect")
            return 
        }


        if( ! document.querySelector("template[mix-replace]") &&
            ! document.querySelector("template[mix-update]") && 
            ! document.querySelector("template[mix-top]") && 
            ! document.querySelector("template[mix-bottom]") && 
            ! document.querySelector("template[mix-before]") && 
            ! document.querySelector("template[mix-after]") && 
            ! document.querySelector("template[mix-function]") 
        ){ 
            cl(`eror = mix-target nor mix-function found`)
            return 
        }

        document.querySelectorAll('template[mix-replace]').forEach(template => {
            try{
                if( template.getAttribute("mix-newurl") && new_url == false ){
                    new_url = template.getAttribute("mix-newurl")
                }  
                console.log(`ok : mix-replace the response data will affect '${template.getAttribute("mix-replace")}'`)                
                document.querySelector(template.getAttribute("mix-replace")).insertAdjacentHTML("afterend", template.innerHTML)
                document.querySelector(template.getAttribute("mix-replace")).remove()              
                if( ! template.getAttribute("mix-push-url") ){ cl(`process_template() - optional - mix-push-url not set`) }
                mix_convert();
                mixonurl(mix_url)
            }catch(error){            
                console.log(error)
            }finally{
                template.remove()
            }
        })
        

        document.querySelectorAll('template[mix-update]').forEach(template => {
            try{
                if( template.getAttribute("mix-newurl") && new_url == false ){
                    new_url = template.getAttribute("mix-newurl")
                }  
                console.log(`ok : mix-update - the response data will affect '${template.getAttribute("mix-update")}'`)
                document.querySelector(template.getAttribute("mix-update")).innerHTML = template.innerHTML
                if( ! template.getAttribute("mix-push-url") ){ cl(`process_template() - optional - mix-push-url not set`) }
                mix_convert();
                mixonurl(mix_url)            
            }catch(error){

            }finally{
                template.remove()
            }

        })

        document.querySelectorAll('template[mix-top]').forEach(template => {
            try{
                if( template.getAttribute("mix-newurl") && new_url == false ){
                    new_url = template.getAttribute("mix-newurl")
                } 
                console.log(`ok : mix-top the response data will affect '${template.getAttribute("mix-top")}'`)
                document.querySelector(template.getAttribute("mix-top")).insertAdjacentHTML("afterbegin", template.innerHTML)
                if( ! template.getAttribute("mix-push-url") ){ cl(`process_template() - optional - mix-push-url not set`) }
                mix_convert();
                mixonurl(mix_url)            
            }catch(error){

            }finally{
                template.remove()
            }

        })


        document.querySelectorAll('template[mix-bottom]').forEach(template => {
            try{
                if( template.getAttribute("mix-newurl") && new_url == false ){
                    new_url = template.getAttribute("mix-newurl")
                } 
                console.log(`ok : mix-bottom the response data will affect '${template.getAttribute("mix-bottom")}'`)
                document.querySelector(template.getAttribute("mix-bottom")).insertAdjacentHTML("beforeend", template.innerHTML)
                if( ! template.getAttribute("mix-push-url") ){ cl(`process_template() - optional - mix-push-url not set`) }
                mix_convert();
                mixonurl(mix_url)            
            }catch(error){

            }finally{
                template.remove()
            }

        })


        document.querySelectorAll('template[mix-before]').forEach(template => {
            try{
                if( template.getAttribute("mix-newurl") && new_url == false ){
                    new_url = template.getAttribute("mix-newurl")
                } 
                console.log(`ok : mix-before the response data will affect '${template.getAttribute("mix-before")}'`)
                document.querySelector(template.getAttribute("mix-before")).insertAdjacentHTML("beforebegin", template.innerHTML)
                if( ! template.getAttribute("mix-push-url") ){ cl(`process_template() - optional - mix-push-url not set`) }
                mix_convert();
                mixonurl(mix_url)            
            }catch(error){

            }finally{
                template.remove()
            }

        })    


        document.querySelectorAll('template[mix-after]').forEach(template => {
            try{
                if( template.getAttribute("mix-newurl") && new_url == false ){
                    new_url = template.getAttribute("mix-newurl")
                } 
                console.log(`ok : mix-after the response data will affect '${template.getAttribute("mix-after")}'`)
                document.querySelector(template.getAttribute("mix-after")).insertAdjacentHTML("afterend", template.innerHTML)
                if( ! template.getAttribute("mix-push-url") ){ cl(`process_template() - optional - mix-push-url not set`) }
                mix_convert();
                mixonurl(mix_url) 
            }catch(error){

            }finally{
                template.remove()
            }

        }) 


        document.querySelectorAll('template[mix-function]').forEach(template => {
            try{
                function_name = template.getAttribute("mix-function")
                console.log(`ok : mix() the response data will run the function '${function_name}'`)
                window[function_name](template.innerHTML)
                  
            }catch(error){

            }finally{
                template.remove()  
            }

        })    
    }catch(error){

    }finally{
        
    }

}


mix_convert()




















