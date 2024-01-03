
        let F = 0
let FRAME = 0
let BLOCK_SIZE = 0
let SAMPLE_RATE = 0
let NULL_SIGNAL = 0
function SND_TO_NULL(m) {}
        
                const i32 = (v) => v
                const f32 = i32
                const f64 = i32
                
function toInt(v) {
                    return v
                }
function toFloat(v) {
                    return v
                }
function createFloatArray(length) {
                    return new Float64Array(length)
                }
function setFloatDataView(dataView, position, value) {
                    dataView.setFloat64(position, value)
                }
function getFloatDataView(dataView, position) {
                    return dataView.getFloat64(position)
                }
const SKED_ID_NULL = -1
const SKED_ID_COUNTER_INIT = 1
const _SKED_WAIT_IN_PROGRESS = 0
const _SKED_WAIT_OVER = 1
const _SKED_MODE_WAIT = 0
const _SKED_MODE_SUBSCRIBE = 1


function sked_create(isLoggingEvents) {
            return {
                eventLog: new Set(),
                events: new Map(),
                requests: new Map(),
                idCounter: SKED_ID_COUNTER_INIT,
                isLoggingEvents,
            }
        }
function sked_wait(skeduler, event, callback) {
            if (skeduler.isLoggingEvents === false) {
                throw new Error("Please activate skeduler's isLoggingEvents")
            }

            if (skeduler.eventLog.has(event)) {
                callback(event)
                return SKED_ID_NULL
            } else {
                return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT)
            }
        }
function sked_wait_future(skeduler, event, callback) {
            return _sked_createRequest(skeduler, event, callback, _SKED_MODE_WAIT)
        }
function sked_subscribe(skeduler, event, callback) {
            return _sked_createRequest(skeduler, event, callback, _SKED_MODE_SUBSCRIBE)
        }
function sked_emit(skeduler, event) {
            if (skeduler.isLoggingEvents === true) {
                skeduler.eventLog.add(event)
            }
            if (skeduler.events.has(event)) {
                const skedIds = skeduler.events.get(event)
                const skedIdsStaying = []
                for (let i = 0; i < skedIds.length; i++) {
                    if (skeduler.requests.has(skedIds[i])) {
                        const request = skeduler.requests.get(skedIds[i])
                        request.callback(event)
                        if (request.mode === _SKED_MODE_WAIT) {
                            skeduler.requests.delete(request.id)
                        } else {
                            skedIdsStaying.push(request.id)
                        }
                    }
                }
                skeduler.events.set(event, skedIdsStaying)
            }
        }
function sked_cancel(skeduler, id) {
            skeduler.requests.delete(id)
        }
function _sked_createRequest(skeduler, event, callback, mode) {
            const id = _sked_nextId(skeduler)
            const request = {
                id, 
                mode, 
                callback,
            }
            skeduler.requests.set(id, request)
            if (!skeduler.events.has(event)) {
                skeduler.events.set(event, [id])    
            } else {
                skeduler.events.get(event).push(id)
            }
            return id
        }
function _sked_nextId(skeduler) {
            return skeduler.idCounter++
        }
const _commons_ENGINE_LOGGED_SKEDULER = sked_create(true)
const _commons_FRAME_SKEDULER = sked_create(false)
function _commons_emitEngineConfigure() {
            sked_emit(_commons_ENGINE_LOGGED_SKEDULER, 'configure')
        }
function _commons_emitFrame(frame) {
            sked_emit(_commons_FRAME_SKEDULER, frame.toString())
        }
const MSG_FLOAT_TOKEN = "number"
const MSG_STRING_TOKEN = "string"
function msg_create(template) {
                    const m = []
                    let i = 0
                    while (i < template.length) {
                        if (template[i] === MSG_STRING_TOKEN) {
                            m.push('')
                            i += 2
                        } else if (template[i] === MSG_FLOAT_TOKEN) {
                            m.push(0)
                            i += 1
                        }
                    }
                    return m
                }
function msg_getLength(message) {
                    return message.length
                }
function msg_getTokenType(message, tokenIndex) {
                    return typeof message[tokenIndex]
                }
function msg_isStringToken(message, tokenIndex) {
                    return msg_getTokenType(message, tokenIndex) === 'string'
                }
function msg_isFloatToken(message, tokenIndex) {
                    return msg_getTokenType(message, tokenIndex) === 'number'
                }
function msg_isMatching(message, tokenTypes) {
                    return (message.length === tokenTypes.length) 
                        && message.every((v, i) => msg_getTokenType(message, i) === tokenTypes[i])
                }
function msg_writeFloatToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function msg_writeStringToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function msg_readFloatToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function msg_readStringToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function msg_floats(values) {
                    return values
                }
function msg_strings(values) {
                    return values
                }
function msg_display(message) {
                    return '[' + message
                        .map(t => typeof t === 'string' ? '"' + t + '"' : t.toString())
                        .join(', ') + ']'
                }
function msg_isBang(message) {
            return (
                msg_isStringToken(message, 0) 
                && msg_readStringToken(message, 0) === 'bang'
            )
        }
function msg_bang() {
            const message = msg_create([MSG_STRING_TOKEN, 4])
            msg_writeStringToken(message, 0, 'bang')
            return message
        }
function msg_emptyToBang(message) {
            if (msg_getLength(message) === 0) {
                return msg_bang()
            } else {
                return message
            }
        }
function commons_waitFrame(frame, callback) {
            return sked_wait_future(_commons_FRAME_SKEDULER, frame.toString(), callback)
        }
function commons_cancelWaitFrame(id) {
            sked_cancel(_commons_FRAME_SKEDULER, id)
        }
function messageTokenToFloat(m, i) {
        if (msg_isFloatToken(m, i)) {
            return msg_readFloatToken(m, i)
        } else {
            return 0
        }
    }
function messageTokenToString(m, i) {
        if (msg_isStringToken(m, i)) {
            const str = msg_readStringToken(m, i)
            if (str === 'bang') {
                return 'symbol'
            } else {
                return str
            }
        } else {
            return 'float'
        }
    }

const MSG_BUSES = new Map()
function msgBusPublish(busName, message) {
            let i = 0
            const callbacks = MSG_BUSES.has(busName) ? MSG_BUSES.get(busName): []
            for (i = 0; i < callbacks.length; i++) {
                callbacks[i](message)
            }
        }
function msgBusSubscribe(busName, callback) {
            if (!MSG_BUSES.has(busName)) {
                MSG_BUSES.set(busName, [])
            }
            MSG_BUSES.get(busName).push(callback)
        }
function msgBusUnsubscribe(busName, callback) {
            if (!MSG_BUSES.has(busName)) {
                return
            }
            const callbacks = MSG_BUSES.get(busName)
            const found = callbacks.indexOf(callback) !== -1
            if (found !== -1) {
                callbacks.splice(found, 1)
            }
        }
function commons_waitEngineConfigure(callback) {
            sked_wait(_commons_ENGINE_LOGGED_SKEDULER, 'configure', callback)
        }


function n_random_setMaxValue(state, maxValue) {
        state.maxValue = Math.max(maxValue, 0)
    }
        


function n_0_1_RCVS_0(m) {
                                
        n_0_17_RCVS_0(msg_bang())
n_0_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_0_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_4_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_0_4_STATE.outMessages[0] = message
                n_0_4_STATE.messageTransferFunctions.splice(0, n_0_4_STATE.messageTransferFunctions.length - 1)
                n_0_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_4_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_17_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_17_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_17_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_17_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_17_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_0_17_STATE.outMessages[0] = message
                n_0_17_STATE.messageTransferFunctions.splice(0, n_0_17_STATE.messageTransferFunctions.length - 1)
                n_0_17_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_17_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_17_STATE.messageTransferFunctions.length; i++) {
                    n_0_20_RCVS_0(n_0_17_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_20_RCVS_0(m) {
                                
            msgBusPublish(n_0_20_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_20", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_0_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_11_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_0_11_STATE.outMessages[0] = message
                n_0_11_STATE.messageTransferFunctions.splice(0, n_0_11_STATE.messageTransferFunctions.length - 1)
                n_0_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_11_STATE.messageTransferFunctions.length; i++) {
                    n_0_5_RCVS_0(n_0_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_5_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            SND_TO_NULL(msg_floats([Math.floor(Math.random() * n_0_5_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_2_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_0_2_STATE.outMessages[0] = message
                n_0_2_STATE.messageTransferFunctions.splice(0, n_0_2_STATE.messageTransferFunctions.length - 1)
                n_0_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_2_STATE.messageTransferFunctions.length; i++) {
                    n_0_13_RCVS_0(n_0_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_13_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_8_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_13_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_8_RCVS_0(m) {
                                
        SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
n_0_18_RCVS_0(msg_bang())
n_0_15_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_15_RCVS_0(m) {
                                
            msgBusPublish(n_0_15_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_15", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_18_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_18_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_18_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_18_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_18_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_18_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_0_18_STATE.outMessages[0] = message
                n_0_18_STATE.messageTransferFunctions.splice(0, n_0_18_STATE.messageTransferFunctions.length - 1)
                n_0_18_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_18_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_18_STATE.messageTransferFunctions.length; i++) {
                    n_0_24_RCVS_0(n_0_18_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_24_RCVS_0(m) {
                                
            msgBusPublish(n_0_24_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_24", inlet "0", unsupported message : ' + msg_display(m))
                            }















        

        function ioRcv_n_0_2_0(m) {n_0_2_RCVS_0(m)}
function ioRcv_n_0_4_0(m) {n_0_4_RCVS_0(m)}
function ioRcv_n_0_11_0(m) {n_0_11_RCVS_0(m)}
function ioRcv_n_0_17_0(m) {n_0_17_RCVS_0(m)}
function ioRcv_n_0_18_0(m) {n_0_18_RCVS_0(m)}
        

        commons_waitFrame(0, () => n_0_1_RCVS_0(msg_bang()))


        const n_0_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_4_STATE.outTemplates[0] = []
            
                n_0_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_4_STATE.outTemplates[0].push(5)
            
            n_0_4_STATE.outMessages[0] = msg_create(n_0_4_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_4_STATE.outMessages[0], 0, "Seed:")
            
        
        
        n_0_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_17_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_17_STATE.outTemplates[0] = []
            
                n_0_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_17_STATE.outTemplates[0].push(4)
            

                n_0_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_17_STATE.outTemplates[0].push(10)
            
            n_0_17_STATE.outMessages[0] = msg_create(n_0_17_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_17_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_17_STATE.outMessages[0], 1, "random2.pd")
            
        
        
        n_0_17_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_17_STATE.outMessages[0]
                }
,
        ]
    

            const n_0_20_STATE = {
                busName: "0-random2",
            }
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("0-seed", n_0_11_RCVS_0)
            })
        

        const n_0_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_0_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_0_11_STATE.outTemplates[0] = []
            
                n_0_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_11_STATE.outTemplates[0].push(4)
            

                n_0_11_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_11_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_0_11_STATE.outMessages[0] = msg_create(n_0_11_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_11_STATE.outMessages[0], 0, "seed")
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_11_STATE.outMessages[0], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_11_STATE.outMessages[0], 1, stringMem[0])
                }
            
        
                    return n_0_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_5_STATE = {
            maxValue: 0
        }
    

        const n_0_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_0_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_0_2_STATE.outTemplates[0] = []
            
                n_0_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_2_STATE.outTemplates[0].push(4)
            

                n_0_2_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_2_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_0_2_STATE.outMessages[0] = msg_create(n_0_2_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_2_STATE.outMessages[0], 0, "seed")
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_2_STATE.outMessages[0], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_2_STATE.outMessages[0], 1, stringMem[0])
                }
            
        
                    return n_0_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_13_STATE = {
            maxValue: 1000000
        }
    


            const n_0_15_STATE = {
                busName: "0-seed",
            }
        

        const n_0_18_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_18_STATE.outTemplates[0] = []
            
                n_0_18_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_18_STATE.outTemplates[0].push(5)
            

                n_0_18_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_18_STATE.outTemplates[0].push(10)
            
            n_0_18_STATE.outMessages[0] = msg_create(n_0_18_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_18_STATE.outMessages[0], 0, "write")
            

                msg_writeStringToken(n_0_18_STATE.outMessages[0], 1, "random2.pd")
            
        
        
        n_0_18_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_18_STATE.outMessages[0]
                }
,
        ]
    

            const n_0_24_STATE = {
                busName: "0-random2",
            }
        

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_2":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[66,238]}},"n_0_4":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[39,123]}},"n_0_11":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[245,192]}},"n_0_17":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[66,77]}},"n_0_18":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[58,330]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_2":{"0":"ioRcv_n_0_2_0"},"n_0_4":{"0":"ioRcv_n_0_4_0"},"n_0_11":{"0":"ioRcv_n_0_11_0"},"n_0_17":{"0":"ioRcv_n_0_17_0"},"n_0_18":{"0":"ioRcv_n_0_18_0"}},"messageSenders":{}}}}},
            configure: (sampleRate, blockSize) => {
                exports.metadata.audioSettings.sampleRate = sampleRate
                exports.metadata.audioSettings.blockSize = blockSize
                SAMPLE_RATE = sampleRate
                BLOCK_SIZE = blockSize
                _commons_emitEngineConfigure()
            },
            loop: (INPUT, OUTPUT) => {
                
        for (F = 0; F < BLOCK_SIZE; F++) {
            _commons_emitFrame(FRAME)
            
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_2: {
                            "0": ioRcv_n_0_2_0,
                        },
n_0_4: {
                            "0": ioRcv_n_0_4_0,
                        },
n_0_11: {
                            "0": ioRcv_n_0_11_0,
                        },
n_0_17: {
                            "0": ioRcv_n_0_17_0,
                        },
n_0_18: {
                            "0": ioRcv_n_0_18_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        

    