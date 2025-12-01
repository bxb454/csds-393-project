(function(){"use strict";var F;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(F||(F={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var P;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(P||(P={}));var j;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(j||(j={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H=["user","model","function","system"];var B;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(B||(B={}));var K;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(K||(K={}));var Y;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(Y||(Y={}));var V;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(V||(V={}));var T;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"})(T||(T={}));var q;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(q||(q={}));var J;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(J||(J={}));var W;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(W||(W={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class O extends g{constructor(t,n){super(t),this.response=n}}class X extends g{constructor(t,n,o,s){super(t),this.status=n,this.statusText=o,this.errorDetails=s}}class y extends g{}class z extends g{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ue="https://generativelanguage.googleapis.com",de="v1beta",fe="0.24.1",he="genai-js";var _;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(_||(_={}));class ge{constructor(t,n,o,s,r){this.model=t,this.task=n,this.apiKey=o,this.stream=s,this.requestOptions=r}toString(){var t,n;const o=((t=this.requestOptions)===null||t===void 0?void 0:t.apiVersion)||de;let r=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||ue}/${o}/${this.model}:${this.task}`;return this.stream&&(r+="?alt=sse"),r}}function me(e){const t=[];return e?.apiClient&&t.push(e.apiClient),t.push(`${he}/${fe}`),t.join(" ")}async function Ee(e){var t;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",me(e.requestOptions)),n.append("x-goog-api-key",e.apiKey);let o=(t=e.requestOptions)===null||t===void 0?void 0:t.customHeaders;if(o){if(!(o instanceof Headers))try{o=new Headers(o)}catch(s){throw new y(`unable to convert customHeaders value ${JSON.stringify(o)} to Headers: ${s.message}`)}for(const[s,r]of o.entries()){if(s==="x-goog-api-key")throw new y(`Cannot set reserved header name ${s}`);if(s==="x-goog-api-client")throw new y(`Header name ${s} can only be set using the apiClient field`);n.append(s,r)}}return n}async function pe(e,t,n,o,s,r){const a=new ge(e,t,n,o,r);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},_e(r)),{method:"POST",headers:await Ee(a),body:s})}}async function b(e,t,n,o,s,r={},a=fetch){const{url:i,fetchOptions:u}=await pe(e,t,n,o,s,r);return Ce(i,u,a)}async function Ce(e,t,n=fetch){let o;try{o=await n(e,t)}catch(s){ye(s,e)}return o.ok||await Re(o,e),o}function ye(e,t){let n=e;throw n.name==="AbortError"?(n=new z(`Request aborted when fetching ${t.toString()}: ${e.message}`),n.stack=e.stack):e instanceof X||e instanceof y||(n=new g(`Error fetching from ${t.toString()}: ${e.message}`),n.stack=e.stack),n}async function Re(e,t){let n="",o;try{const s=await e.json();n=s.error.message,s.error.details&&(n+=` ${JSON.stringify(s.error.details)}`,o=s.error.details)}catch{}throw new X(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${n}`,e.status,e.statusText,o)}function _e(e){const t={};if(e?.signal!==void 0||e?.timeout>=0){const n=new AbortController;e?.timeout>=0&&setTimeout(()=>n.abort(),e.timeout),e?.signal&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),L(e.candidates[0]))throw new O(`${R(e)}`,e);return Oe(e)}else if(e.promptFeedback)throw new O(`Text not available. ${R(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),L(e.candidates[0]))throw new O(`${R(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),Q(e)[0]}else if(e.promptFeedback)throw new O(`Function call not available. ${R(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),L(e.candidates[0]))throw new O(`${R(e)}`,e);return Q(e)}else if(e.promptFeedback)throw new O(`Function call not available. ${R(e)}`,e)},e}function Oe(e){var t,n,o,s;const r=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const a of(s=(o=e.candidates)===null||o===void 0?void 0:o[0].content)===null||s===void 0?void 0:s.parts)a.text&&r.push(a.text),a.executableCode&&r.push("\n```"+a.executableCode.language+`
`+a.executableCode.code+"\n```\n"),a.codeExecutionResult&&r.push("\n```\n"+a.codeExecutionResult.output+"\n```\n");return r.length>0?r.join(""):""}function Q(e){var t,n,o,s;const r=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const a of(s=(o=e.candidates)===null||o===void 0?void 0:o[0].content)===null||s===void 0?void 0:s.parts)a.functionCall&&r.push(a.functionCall);if(r.length>0)return r}const Te=[T.RECITATION,T.SAFETY,T.LANGUAGE];function L(e){return!!e.finishReason&&Te.includes(e.finishReason)}function R(e){var t,n,o;let s="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)s+="Response was blocked",!((t=e.promptFeedback)===null||t===void 0)&&t.blockReason&&(s+=` due to ${e.promptFeedback.blockReason}`),!((n=e.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(s+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((o=e.candidates)===null||o===void 0)&&o[0]){const r=e.candidates[0];L(r)&&(s+=`Candidate was blocked due to ${r.finishReason}`,r.finishMessage&&(s+=`: ${r.finishMessage}`))}return s}function v(e){return this instanceof v?(this.v=e,this):new v(e)}function be(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var o=n.apply(e,t||[]),s,r=[];return s={},a("next"),a("throw"),a("return"),s[Symbol.asyncIterator]=function(){return this},s;function a(c){o[c]&&(s[c]=function(l){return new Promise(function(h,p){r.push([c,l,h,p])>1||i(c,l)})})}function i(c,l){try{u(o[c](l))}catch(h){f(r[0][3],h)}}function u(c){c.value instanceof v?Promise.resolve(c.value.v).then(E,d):f(r[0][2],c)}function E(c){i("next",c)}function d(c){i("throw",c)}function f(c,l){c(l),r.shift(),r.length&&i(r[0][0],r[0][1])}}typeof SuppressedError=="function"&&SuppressedError;/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function ve(e){const t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=we(t),[o,s]=n.tee();return{stream:Ae(o),response:Ie(s)}}async function Ie(e){const t=[],n=e.getReader();for(;;){const{done:o,value:s}=await n.read();if(o)return G(Se(t));t.push(s)}}function Ae(e){return be(this,arguments,function*(){const n=e.getReader();for(;;){const{value:o,done:s}=yield v(n.read());if(s)break;yield yield v(G(o))}})}function we(e){const t=e.getReader();return new ReadableStream({start(o){let s="";return r();function r(){return t.read().then(({value:a,done:i})=>{if(i){if(s.trim()){o.error(new g("Failed to parse stream"));return}o.close();return}s+=a;let u=s.match(Z),E;for(;u;){try{E=JSON.parse(u[1])}catch{o.error(new g(`Error parsing JSON response: "${u[1]}"`));return}o.enqueue(E),s=s.substring(u[0].length),u=s.match(Z)}return r()}).catch(a=>{let i=a;throw i.stack=a.stack,i.name==="AbortError"?i=new z("Request aborted when reading from the stream"):i=new g("Error reading from the stream"),i})}}})}function Se(e){const t=e[e.length-1],n={promptFeedback:t?.promptFeedback};for(const o of e){if(o.candidates){let s=0;for(const r of o.candidates)if(n.candidates||(n.candidates=[]),n.candidates[s]||(n.candidates[s]={index:s}),n.candidates[s].citationMetadata=r.citationMetadata,n.candidates[s].groundingMetadata=r.groundingMetadata,n.candidates[s].finishReason=r.finishReason,n.candidates[s].finishMessage=r.finishMessage,n.candidates[s].safetyRatings=r.safetyRatings,r.content&&r.content.parts){n.candidates[s].content||(n.candidates[s].content={role:r.content.role||"user",parts:[]});const a={};for(const i of r.content.parts)i.text&&(a.text=i.text),i.functionCall&&(a.functionCall=i.functionCall),i.executableCode&&(a.executableCode=i.executableCode),i.codeExecutionResult&&(a.codeExecutionResult=i.codeExecutionResult),Object.keys(a).length===0&&(a.text=""),n.candidates[s].content.parts.push(a)}s++}o.usageMetadata&&(n.usageMetadata=o.usageMetadata)}return n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ee(e,t,n,o){const s=await b(t,_.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),o);return ve(s)}async function te(e,t,n,o){const r=await(await b(t,_.GENERATE_CONTENT,e,!1,JSON.stringify(n),o)).json();return{response:G(r)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ne(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function I(e){let t=[];if(typeof e=="string")t=[{text:e}];else for(const n of e)typeof n=="string"?t.push({text:n}):t.push(n);return Ne(t)}function Ne(e){const t={role:"user",parts:[]},n={role:"function",parts:[]};let o=!1,s=!1;for(const r of e)"functionResponse"in r?(n.parts.push(r),s=!0):(t.parts.push(r),o=!0);if(o&&s)throw new g("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!o&&!s)throw new g("No content is provided for sending chat message.");return o?t:n}function Me(e,t){var n;let o={model:t?.model,generationConfig:t?.generationConfig,safetySettings:t?.safetySettings,tools:t?.tools,toolConfig:t?.toolConfig,systemInstruction:t?.systemInstruction,cachedContent:(n=t?.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const s=e.generateContentRequest!=null;if(e.contents){if(s)throw new y("CountTokensRequest must have one of contents or generateContentRequest, not both.");o.contents=e.contents}else if(s)o=Object.assign(Object.assign({},o),e.generateContentRequest);else{const r=I(e);o.contents=[r]}return{generateContentRequest:o}}function oe(e){let t;return e.contents?t=e:t={contents:[I(e)]},e.systemInstruction&&(t.systemInstruction=ne(e.systemInstruction)),t}function Le(e){return typeof e=="string"||Array.isArray(e)?{content:I(e)}:e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const se=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],De={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function $e(e){let t=!1;for(const n of e){const{role:o,parts:s}=n;if(!t&&o!=="user")throw new g(`First content should be with role 'user', got ${o}`);if(!H.includes(o))throw new g(`Each item should include role field. Got ${o} but valid roles are: ${JSON.stringify(H)}`);if(!Array.isArray(s))throw new g("Content should have 'parts' property with an array of Parts");if(s.length===0)throw new g("Each Content should have at least one part");const r={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const i of s)for(const u of se)u in i&&(r[u]+=1);const a=De[o];for(const i of se)if(!a.includes(i)&&r[i]>0)throw new g(`Content with role '${o}' can't contain '${i}' part`);t=!0}}function re(e){var t;if(e.candidates===void 0||e.candidates.length===0)return!1;const n=(t=e.candidates[0])===null||t===void 0?void 0:t.content;if(n===void 0||n.parts===void 0||n.parts.length===0)return!1;for(const o of n.parts)if(o===void 0||Object.keys(o).length===0||o.text!==void 0&&o.text==="")return!1;return!0}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ae="SILENT_ERROR";class ke{constructor(t,n,o,s={}){this.model=n,this.params=o,this._requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,o?.history&&($e(o.history),this._history=o.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t,n={}){var o,s,r,a,i,u;await this._sendPromise;const E=I(t),d={safetySettings:(o=this.params)===null||o===void 0?void 0:o.safetySettings,generationConfig:(s=this.params)===null||s===void 0?void 0:s.generationConfig,tools:(r=this.params)===null||r===void 0?void 0:r.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(i=this.params)===null||i===void 0?void 0:i.systemInstruction,cachedContent:(u=this.params)===null||u===void 0?void 0:u.cachedContent,contents:[...this._history,E]},f=Object.assign(Object.assign({},this._requestOptions),n);let c;return this._sendPromise=this._sendPromise.then(()=>te(this._apiKey,this.model,d,f)).then(l=>{var h;if(re(l.response)){this._history.push(E);const p=Object.assign({parts:[],role:"model"},(h=l.response.candidates)===null||h===void 0?void 0:h[0].content);this._history.push(p)}else{const p=R(l.response);p&&console.warn(`sendMessage() was unsuccessful. ${p}. Inspect response object for details.`)}c=l}).catch(l=>{throw this._sendPromise=Promise.resolve(),l}),await this._sendPromise,c}async sendMessageStream(t,n={}){var o,s,r,a,i,u;await this._sendPromise;const E=I(t),d={safetySettings:(o=this.params)===null||o===void 0?void 0:o.safetySettings,generationConfig:(s=this.params)===null||s===void 0?void 0:s.generationConfig,tools:(r=this.params)===null||r===void 0?void 0:r.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(i=this.params)===null||i===void 0?void 0:i.systemInstruction,cachedContent:(u=this.params)===null||u===void 0?void 0:u.cachedContent,contents:[...this._history,E]},f=Object.assign(Object.assign({},this._requestOptions),n),c=ee(this._apiKey,this.model,d,f);return this._sendPromise=this._sendPromise.then(()=>c).catch(l=>{throw new Error(ae)}).then(l=>l.response).then(l=>{if(re(l)){this._history.push(E);const h=Object.assign({},l.candidates[0].content);h.role||(h.role="model"),this._history.push(h)}else{const h=R(l);h&&console.warn(`sendMessageStream() was unsuccessful. ${h}. Inspect response object for details.`)}}).catch(l=>{l.message!==ae&&console.error(l)}),c}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ge(e,t,n,o){return(await b(t,_.COUNT_TOKENS,e,!1,JSON.stringify(n),o)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xe(e,t,n,o){return(await b(t,_.EMBED_CONTENT,e,!1,JSON.stringify(n),o)).json()}async function Ue(e,t,n,o){const s=n.requests.map(a=>Object.assign(Object.assign({},a),{model:t}));return(await b(t,_.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:s}),o)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(t,n,o={}){this.apiKey=t,this._requestOptions=o,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=ne(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(t,n={}){var o;const s=oe(t),r=Object.assign(Object.assign({},this._requestOptions),n);return te(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(o=this.cachedContent)===null||o===void 0?void 0:o.name},s),r)}async generateContentStream(t,n={}){var o;const s=oe(t),r=Object.assign(Object.assign({},this._requestOptions),n);return ee(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(o=this.cachedContent)===null||o===void 0?void 0:o.name},s),r)}startChat(t){var n;return new ke(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},t),this._requestOptions)}async countTokens(t,n={}){const o=Me(t,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),s=Object.assign(Object.assign({},this._requestOptions),n);return Ge(this.apiKey,this.model,o,s)}async embedContent(t,n={}){const o=Le(t),s=Object.assign(Object.assign({},this._requestOptions),n);return xe(this.apiKey,this.model,o,s)}async batchEmbedContents(t,n={}){const o=Object.assign(Object.assign({},this._requestOptions),n);return Ue(this.apiKey,this.model,t,o)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(t){this.apiKey=t}getGenerativeModel(t,n){if(!t.model)throw new g("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new ie(this.apiKey,t,n)}getGenerativeModelFromCachedContent(t,n,o){if(!t.name)throw new y("Cached content must contain a `name` field.");if(!t.model)throw new y("Cached content must contain a `model` field.");const s=["model","systemInstruction"];for(const a of s)if(n?.[a]&&t[a]&&n?.[a]!==t[a]){if(a==="model"){const i=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,u=t.model.startsWith("models/")?t.model.replace("models/",""):t.model;if(i===u)continue}throw new y(`Different value for "${a}" specified in modelParams (${n[a]}) and cachedContent (${t[a]})`)}const r=Object.assign(Object.assign({},n),{model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t});return new ie(this.apiKey,r,o)}}class A{constructor(t){this.createModel=t??(n=>new Fe(n).getGenerativeModel({model:"gemini-2.5-flash",generationConfig:{responseMimeType:"application/json",temperature:.5}}))}static buildPrompt(t){const n=t.albumOrPlaylistName?.trim()||"Unknown",o=t.userContext?.genres?.length?t.userContext.genres.join(", "):"none",s=[`Album/Playlist="${n}"`,`Genres=${o}`];return t.userContext?.timeOfDay&&s.push(`Time=${t.userContext.timeOfDay}`),t.userContext?.weather&&s.push(`Weather=${t.userContext.weather}`),["You generate Chrome themes from album art.","Return strict JSON with shape:",'{"theme":{"colors":{"primary":{"r":0-255,"g":0-255,"b":0-255,"a":0-1},"secondary":{...},"accent":{...},"background":{...},"foreground":{...}},"backgroundImageDataUrl":"data:image/png;base64,..."}}.',"Ensure readable contrast between foreground and background, and make sure that if ",`Context: ${s.join("; ")}`].join(`
`)}setApiKey(t){this.apiKey=t,this.model=void 0}static buildPromptParts(t){const o=[{text:A.buildPrompt({albumOrPlaylistName:t.albumOrPlaylistName,userContext:t.userContext})}];return t.albumArtBase64&&o.push(A.toImagePart(t.albumArtBase64)),o}static toImagePart(t){if(t.startsWith("data:")){const o=t.match(/^data:(.+?);base64,(.*)$/),s=o?.[1]??"image/png",r=o?.[2]??t.split(",")[1]??"";return{inlineData:{mimeType:s,data:r}}}return{inlineData:{mimeType:"image/png",data:t}}}async generateTheme(t){if(!this.apiKey)throw new Error("GEMINI_API_KEY_REQUIRED");this.model??=this.createModel(this.apiKey);const n=A.buildPromptParts(t),o=await this.model.generateContent({contents:[{role:"user",parts:n}]});console.log("LLM raw output:",o);const s=o.response.candidates?.[0];if(console.log("LLM candidate output:",s),!s)throw new Error("No candidates returned from LLM");alert(`LLM raw output based on theme ${t.userContext.genres.join(", ")} is:  
`+JSON.stringify(o));for(const a of o.response.candidates??[])console.log("LLM candidate:",a);const r=o.response.text();return JSON.parse(r)}}const C={make:(e,t)=>{const n=new Error(t);return n.code=e,n}},D="https://api.spotify.com/v1";async function $(){return new Promise((e,t)=>{chrome.storage.local.get(["token"],n=>{if(chrome.runtime.lastError){t(C.make("CHROME_STORAGE_ERROR",chrome.runtime.lastError.message||"Storage error"));return}if(!n.token){t(C.make("AUTH_REQUIRED","Spotify login required"));return}e(n.token)})})}const w={client:new A,setApiKey(e){this.client.setApiKey(e)},getFallbackRandomTheme(){const e=d=>{const[f,c,l]=[d.r,d.g,d.b].map(h=>{const p=h/255;return p<=.03928?p/12.92:Math.pow((p+.055)/1.055,2.4)});return .2126*f+.7152*c+.0722*l},t=(d,f)=>{const c=e(d),l=e(f),h=Math.max(c,l),p=Math.min(c,l);return(h+.05)/(p+.05)},n=()=>({r:Math.floor(Math.random()*256),g:Math.floor(Math.random()*256),b:Math.floor(Math.random()*256),a:1}),o=()=>{let d,f,c=0;do d=n(),f=n(),c++;while(t(d,f)<4.5&&c<100);return t(d,f)<4.5&&(d={r:18,g:18,b:18,a:1},f={r:255,g:255,b:255,a:1}),{bg:d,fg:f}},s=d=>{let f,c=0;do f=n(),c++;while(d.some(l=>t(f,l)<2)&&c<50);return f},{bg:r,fg:a}=o(),i=s([r,a]),u=s([r,a,i]),E=s([r,a,i,u]);return{colors:{background:r,foreground:a,primary:i,secondary:u,accent:E},backgroundImageDataUrl:""}},async generateRandomTheme(){try{const e={albumOrPlaylistName:"Random Theme",albumArtBase64:"",userContext:{genres:["random","experimental","abstract"]}},t=await this.client.generateTheme(e),n=this.parseThemeResponse(t);return ce(n),console.log("Generated random theme:",n),console.log("rgb values:",n.colors.primary,n.colors.secondary,n.colors.accent,n.colors.background,n.colors.foreground),alert(`Your LLM-generated colors are: 
`+JSON.stringify(n.colors)),n}catch(e){return console.error("Failed to generate random theme:",e),alert("Failed to generate random theme using Gemini LLM wrapper. Fallback random theme created without llm input."),this.getFallbackRandomTheme()}},async listPlaylists(){const e=$(),t=[];let n=`${D}/me/playlists?offset=0&limit=50`;for(;n;){const o=await fetch(n,{headers:{Authorization:`Bearer ${e}`}});if(!o.ok)throw C.make("SPOTIFY_ERROR",`GET ${n} failed`);const s=await o.json();(s.items??[]).forEach(r=>t.push(r.name)),n=s.next}return t},async getPlaylistArt(e){const t=$();let n=`${D}/me/playlists?limit=50`;for(;n;){const o=await fetch(n,{headers:{Authorization:`Bearer ${t}`}});if(!o.ok)throw C.make("SPOTIFY_ERROR",`GET ${n} failed`);const s=await o.json(),r=(s.items??[]).find(a=>(a.name||"").toLowerCase()===e.toLowerCase());if(r)return r.images?.[0]?.url??null;n=s.next}return null},async findAlbum(e){const t=$(),n=await fetch(`${D}/search?`+new URLSearchParams({q:`album:${e}`,type:"album",limit:"1"}),{headers:{Authorization:`Bearer ${t}`}});if(!n.ok)throw C.make("SPOTIFY_ERROR","Search failed");return(await n.json())?.albums?.items?.[0]?.images?.[0]?.url??null},async generateThemeFromAlbumArt(e,t){const n=Math.max(0,t?.retries??1),o=await Pe(e);let s;for(let r=0;r<=n;r++)try{const a={albumOrPlaylistName:"",albumArtBase64:o,userContext:t?.userContext??{genres:[]}},i=await this.client.generateTheme(a),u=this.parseThemeResponse(i);return ce(u),t?.apply&&console.log("Applying Base Spotify theme:",u),u}catch(a){s=a;const i=a?.response?.status??0;if(i>=400&&i<500&&i!==429)break}throw this.handleLLMError(s),C.make("LLM_ERROR","LLM failed to generate theme after retries")},async getCurrentlyPlayingArt(){const e=await $(),t=await fetch(`${D}/me/player/currently-playing`,{headers:{Authorization:`Bearer ${e}`}});if(t.status===204)return null;if(!t.ok)throw C.make("SPOTIFY_ERROR","Failed to get currently playing");return(await t.json())?.item?.album?.images?.[0]?.url??null},parseThemeResponse(e){if(!e?.theme)throw C.make("LLM_ERROR","LLM response missing 'theme'");return e.theme},handleLLMError(e){const t=e instanceof Error?e.message:"Unknown LLM error";throw C.make("LLM_ERROR",t)}};function ce(e){for(const t of["primary","secondary","accent","background","foreground"])if(!e?.colors?.[t])throw C.make("THEME_INVALID",`Missing colors.${t}`)}function Pe(e){return new Promise((t,n)=>{const o=new FileReader;o.onerror=()=>n(o.error),o.onload=()=>t(String(o.result)),o.readAsDataURL(e)})}const je={rock:{colors:{primary:{r:220,g:38,b:38,a:1},secondary:{r:30,g:30,b:30,a:1},accent:{r:255,g:193,b:7,a:1},background:{r:18,g:18,b:18,a:1},foreground:{r:255,g:255,b:255,a:1}},backgroundImageDataUrl:""},jazz:{colors:{primary:{r:79,g:70,b:229,a:1},secondary:{r:31,g:41,b:55,a:1},accent:{r:251,g:191,b:36,a:1},background:{r:17,g:24,b:39,a:1},foreground:{r:243,g:244,b:246,a:1}},backgroundImageDataUrl:""}},m={PRIMARY:"--theme-primary",SECONDARY:"--theme-secondary",ACCENT:"--theme-accent",BACKGROUND:"--theme-background",FOREGROUND:"--theme-foreground"},k="--theme-bg-image";let S=null,x="";function N({r:e,g:t,b:n,a:o}){return`rgba(${e}, ${t}, ${n}, ${o})`}function le(){if(S)return;const e=document.documentElement,t=getComputedStyle(e);S={};for(const n of Object.values(m))S[n]=t.getPropertyValue(n).trim();S[k]=t.getPropertyValue(k).trim(),x=e.style.transition||""}async function He(e){return e.album?.images?.[0]?.url?e.album.images[0].url:await w.getCurrentlyPlayingArt().catch(()=>null)}const U="llm-theme-injection";function Be(){let e=document.getElementById(U);return e||(e=document.createElement("style"),e.id=U,document.head.appendChild(e)),e}const M={applyTheme(e){le();const t=`:root {
      ${m.PRIMARY}: ${N(e.colors.primary)};
      ${m.SECONDARY}: ${N(e.colors.secondary)};
      ${m.ACCENT}: ${N(e.colors.accent)};
      ${m.BACKGROUND}: ${N(e.colors.background)};
      ${m.FOREGROUND}: ${N(e.colors.foreground)};
  }
      html, body {
      background: var(${m.BACKGROUND}) !important;
      color: var(${m.FOREGROUND}) !important;
  }
      a, a:visited {
      color: var(${m.ACCENT}) !important; }
      button, input[type="button"], input[type="submit"] {
      background-color: var(${m.PRIMARY}) !important;
      color: var(${m.FOREGROUND}) !important;
  }
      button:hover, input[type="button"]:hover, input[type="submit"]:hover {
      background-color: var(${m.ACCENT}) !important;
      color: var(${m.BACKGROUND}) !important;
  }
      `;Be().textContent=t;const n=document.documentElement;e.backgroundImageDataUrl?n.style.setProperty(k,`url(${e.backgroundImageDataUrl})`):n.style.removeProperty(k)},async generateThemeFromTrack(e){const t=await He(e);if(t){const n=await fetch(t).catch(()=>null);if(n?.ok){const o=await n.blob();return w.generateThemeFromAlbumArt(o,{userContext:{genres:e.genres??[]}})}}if(e.genres?.length){const n=e.genres[0].toLowerCase(),o=this.getThemeForGenre(n);if(o)return Object.entries(o.colors).forEach(([s,r])=>{console.log(`${JSON.stringify(s)} => ${JSON.stringify(r)}`)}),console.log(`Using preset theme for genre: ${n}`),o}return w.generateRandomTheme()},getThemeForGenre(e){return je[e.toLowerCase()]??null},applyThemeTransition(e,t,n){le();const o=document.documentElement,s=x;o.style.transition=`all ${n}ms ease-in-out`,this.applyTheme(e),window.setTimeout(()=>{this.applyTheme(t),window.setTimeout(()=>{s?o.style.transition=s:o.style.removeProperty("transition")},n)},0)},resetToDefault(){const e=document.getElementById(U);e&&e.remove(),S=null,x=""}};w.setApiKey("AIzaSyBd03eiih5PK_-U1HMLX3GbS1J-ZRuxpyg"),chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.action==="applyRandomTheme")return Ke(n),!0;if(e.action==="applyPlaylistTheme")return Ye(e.trackMetadata,n),!0;e.action==="resetTheme"&&(M.resetToDefault(),n({status:"Theme reset successfully!"}))});async function Ke(e){try{const t=await w.generateRandomTheme();M.applyTheme(t),chrome.storage.local.set({currentTheme:t}),e({status:"Random theme applied successfully!"})}catch(t){e({status:`Error: ${t instanceof Error?t.message:"Failed to generate theme"}`})}}async function Ye(e,t){try{const n=await M.generateThemeFromTrack(e);M.applyTheme(n),chrome.storage.local.set({currentTheme:n}),t({status:`Theme generated for "${e.name}"`})}catch(n){t({status:`Error: ${n instanceof Error?n.message:"Failed to generate theme"}`})}}chrome.storage.local.get(["currentTheme"],e=>{e.currentTheme&&M.applyTheme(e.currentTheme)})})();
