const fetch = require('node-fetch');
const URL = require('url');
require('dotenv').config()
const config = require('./config');

const domain = config['domain']
const workspaceOid = config['workspaceOid'];
const projectOid = config['projectOid'];
const apiPath = config['apiPath']
const { APIKEY } = process.env;

const baseUrl = `${domain}/${apiPath}`
const [feature, story] = config['supportedTypes'].split(',')

///portfolioitem/feature/create

var headers = {
    "Content-Type":"application/json",
    'zsessionid': APIKEY
}

const stories = []

const requestBody = async (workitemType, parent = undefined) => {
    let body = {};
    let timestamp = Date.now();
    if (workitemType.toLowerCase() == 'story' || workitemType.toLowerCase() == 'hierarchicalrequirement'){
        body = {"hierarchicalrequirement":{
        "workspace":`workspace/${workspaceOid}`,
        "project":`project/${projectOid}`, 
        "name": `Inator Story ${timestamp}`,
        "description": "Story via REST",
        "portfolioitem": parent}}
    } else if(workitemType.toLowerCase() == 'feature'){
        body = {"portfolioitem/feature":{
            "workspace":`workspace/${workspaceOid}`,
            "project":`project/${projectOid}`, 
            "name": `Inator Feature ${timestamp}`,
            "description": "Feature via REST"}}
    }
    return body;
 }

 const createWorkitem = async (body = {}) => {
    const createEndpoint = `${Object.keys(body)[0]}/create`
    try{
        const response = await fetch(`${baseUrl}/${createEndpoint}`, {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin', 
            headers: headers,
            body: JSON.stringify(body) 
          });
        return response.json(); 
    }catch{
      console.log(err)
    }
  }

  (async function() {  
    try{
        let featureRef = await requestBody(feature).then(createWorkitem).then(res => res['CreateResult']['Object']['_ref']);
        for(let i = 0; i < 10; i++){
            await new Promise(async next => {
                await requestBody(story, featureRef).then(createWorkitem).then(res => stories.push(res['CreateResult']['Object']['_ref'])); 
                next()
            })
        }
    }catch (error) {
        console.log(error)
    }
})()
