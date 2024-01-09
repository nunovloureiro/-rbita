
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
function commons_waitFrame(frame, callback) {
            return sked_wait_future(_commons_FRAME_SKEDULER, frame.toString(), callback)
        }
function commons_cancelWaitFrame(id) {
            sked_cancel(_commons_FRAME_SKEDULER, id)
        }

function n_control_setReceiveBusName(state, busName) {
        if (state.receiveBusName !== "empty") {
            msgBusUnsubscribe(state.receiveBusName, state.messageReceiver)
        }
        state.receiveBusName = busName
        if (state.receiveBusName !== "empty") {
            msgBusSubscribe(state.receiveBusName, state.messageReceiver)
        }
    }
function n_control_setSendReceiveFromMessage(state, m) {
        if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
            && msg_readStringToken(m, 0) === 'receive'
        ) {
            n_control_setReceiveBusName(state, msg_readStringToken(m, 1))
            return true

        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
            && msg_readStringToken(m, 0) === 'send'
        ) {
            state.sendBusName = msg_readStringToken(m, 1)
            return true
        }
        return false
    }
function n_control_defaultMessageHandler(m) {}
function n_bang_receiveMessage(state, m) {
                if (n_control_setSendReceiveFromMessage(state, m) === true) {
                    return
                }
                
                const outMessage = msg_bang()
                state.messageSender(outMessage)
                if (state.sendBusName !== "empty") {
                    msgBusPublish(state.sendBusName, outMessage)
                }
                return
            }

function n_random_setMaxValue(state, maxValue) {
        state.maxValue = Math.max(maxValue, 0)
    }
function msg_copyTemplate(src, start, end) {
            const template = []
            for (let i = start; i < end; i++) {
                const tokenType = msg_getTokenType(src, i)
                template.push(tokenType)
                if (tokenType === MSG_STRING_TOKEN) {
                    template.push(msg_readStringToken(src, i).length)
                }
            }
            return template
        }
function msg_copyMessage(src, dest, srcStart, srcEnd, destStart) {
            let i = srcStart
            let j = destStart
            for (i, j; i < srcEnd; i++, j++) {
                if (msg_getTokenType(src, i) === MSG_STRING_TOKEN) {
                    msg_writeStringToken(dest, j, msg_readStringToken(src, i))
                } else {
                    msg_writeFloatToken(dest, j, msg_readFloatToken(src, i))
                }
            }
        }
function msg_slice(message, start, end) {
            if (msg_getLength(message) <= start) {
                throw new Error('message empty')
            }
            const template = msg_copyTemplate(message, start, end)
            const newMessage = msg_create(template)
            msg_copyMessage(message, newMessage, start, end, 0)
            return newMessage
        }
function msg_concat(message1, message2) {
            const newMessage = msg_create(msg_copyTemplate(message1, 0, msg_getLength(message1)).concat(msg_copyTemplate(message2, 0, msg_getLength(message2))))
            msg_copyMessage(message1, newMessage, 0, msg_getLength(message1), 0)
            msg_copyMessage(message2, newMessage, 0, msg_getLength(message2), msg_getLength(message1))
            return newMessage
        }
function msg_shift(message) {
            switch (msg_getLength(message)) {
                case 0:
                    throw new Error('message empty')
                case 1:
                    return msg_create([])
                default:
                    return msg_slice(message, 1, msg_getLength(message))
            }
        }

function n_floatatom_receiveMessage(state, m) {
                    if (msg_isBang(m)) {
                        state.messageSender(state.value)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, state.value)
                        }
                        return
                    
                    } else if (
                        msg_getTokenType(m, 0) === MSG_STRING_TOKEN
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        const setMessage = msg_slice(m, 1, msg_getLength(m))
                        if (msg_isMatching(setMessage, [MSG_FLOAT_TOKEN])) { 
                                state.value = setMessage    
                                return
                        }
        
                    } else if (n_control_setSendReceiveFromMessage(state, m) === true) {
                        return
                        
                    } else if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    
                        state.value = m
                        state.messageSender(state.value)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, state.value)
                        }
                        return
        
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
function messageTokenToFloat(m, i) {
        if (msg_isFloatToken(m, i)) {
            return msg_readFloatToken(m, i)
        } else {
            return 0
        }
    }
function roundFloatAsPdInt(value) {
        return value > 0 ? Math.floor(value): Math.ceil(value)
    }
const _commons_ARRAYS = new Map()
const _commons_ARRAYS_SKEDULER = sked_create(false)
function commons_getArray(arrayName) {
            if (!_commons_ARRAYS.has(arrayName)) {
                throw new Error('Unknown array ' + arrayName)
            }
            return _commons_ARRAYS.get(arrayName)
        }
function commons_hasArray(arrayName) {
            return _commons_ARRAYS.has(arrayName)
        }
function commons_setArray(arrayName, array) {
            _commons_ARRAYS.set(arrayName, array)
            sked_emit(_commons_ARRAYS_SKEDULER, arrayName)
        }
function commons_subscribeArrayChanges(arrayName, callback) {
            const id = sked_subscribe(_commons_ARRAYS_SKEDULER, arrayName, callback)
            if (_commons_ARRAYS.has(arrayName)) {
                callback(arrayName)
            }
            return id
        }
function commons_cancelArrayChangesSubscription(id) {
            sked_cancel(_commons_ARRAYS_SKEDULER, id)
        }


function n_float_int_setValueInt(state, value) {
        state.value = roundFloatAsPdInt(value)
    }
function n_float_int_setValueFloat(state, value) {
        state.value = value
    }

function n_spigot_setIsClosed(state, value) {
        state.isClosed = (value === 0)
    }


function computeUnitInSamples(sampleRate, amount, unit) {
        if (unit === 'msec' || unit === 'millisecond') {
            return amount / 1000 * sampleRate
        } else if (unit === 'sec' || unit === 'seconds' || unit === 'second') {
            return amount * sampleRate
        } else if (unit === 'min' || unit === 'minutes' || unit === 'minute') {
            return amount * 60 * sampleRate
        } else if (unit === 'samp' || unit === 'samples' || unit === 'sample') {
            return amount
        } else {
            throw new Error("invalid time unit : " + unit)
        }
    }

function n_delay_setDelay(state, delay) {
                state.delay = Math.max(0, delay)
            }
function n_delay_scheduleDelay(state, callback, currentFrame) {
                if (state.scheduledBang !== SKED_ID_NULL) {
                    n_delay_stop(state)
                }
                state.scheduledBang = commons_waitFrame(toInt(
                    Math.round(
                        toFloat(currentFrame) + state.delay * state.sampleRatio)),
                    callback
                )
            }
function n_delay_stop(state) {
                commons_cancelWaitFrame(state.scheduledBang)
                state.scheduledBang = SKED_ID_NULL
            }

        
function n_0_0_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_0_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_34_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_34_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_1_RCVS_0(m) {
                                
                if (n_0_1_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_1_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_1_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_1_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_1_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_2_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_1_STATE.stringFilter
                    ) {
                        n_0_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_1_STATE.floatFilter
                ) {
                    n_0_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_4_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_4_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_35_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_5_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_35_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_5_RCVS_0(m) {
                                
                if (n_0_5_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_5_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_5_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_5_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_5_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_6_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_5_STATE.stringFilter
                    ) {
                        n_0_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_5_STATE.floatFilter
                ) {
                    n_0_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_6_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_6_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_7_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_7_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_36_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_36_SNDS_0(msg_floats([Math.floor(Math.random() * n_0_36_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_8_RCVS_0(m) {
                                
                if (n_0_8_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_8_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_8_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_8_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_8_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_9_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_8_STATE.stringFilter
                    ) {
                        n_0_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_8_STATE.floatFilter
                ) {
                    n_0_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_9_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_9_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_10_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_10_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_11_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_11_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_37_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_37_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_37", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_12_RCVS_0(m) {
                                
                if (n_0_12_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_12_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_12_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_12_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_12_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_13_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_12_STATE.stringFilter
                    ) {
                        n_0_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_12_STATE.floatFilter
                ) {
                    n_0_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_13_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_13_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_16_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_16_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_33_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_17_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_33_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_33", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_17_RCVS_0(m) {
                                
                if (n_0_17_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_17_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_17_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_17_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_17_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_18_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_17_STATE.stringFilter
                    ) {
                        n_0_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_17_STATE.floatFilter
                ) {
                    n_0_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_18_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_18_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_19_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_19_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_38_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_20_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_38_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_20_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_0_21_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_0_22_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_0_23_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_0_24_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_0_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_21_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_21_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_21_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_21_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_21_STATE.outTemplates[0])
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
                n_0_21_STATE.outMessages[0] = message
                n_0_21_STATE.messageTransferFunctions.splice(0, n_0_21_STATE.messageTransferFunctions.length - 1)
                n_0_21_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_21_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_21_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_21_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_22_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_22_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_22_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_22_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_22_STATE.outTemplates[0])
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
                n_0_22_STATE.outMessages[0] = message
                n_0_22_STATE.messageTransferFunctions.splice(0, n_0_22_STATE.messageTransferFunctions.length - 1)
                n_0_22_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_22_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_22_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_22_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_23_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_23_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_23_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_23_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_23_STATE.outTemplates[0])
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
                n_0_23_STATE.outMessages[0] = message
                n_0_23_STATE.messageTransferFunctions.splice(0, n_0_23_STATE.messageTransferFunctions.length - 1)
                n_0_23_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_23_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_23_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_23_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_24_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_24_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_24_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_24_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_24_STATE.outTemplates[0])
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
                n_0_24_STATE.outMessages[0] = message
                n_0_24_STATE.messageTransferFunctions.splice(0, n_0_24_STATE.messageTransferFunctions.length - 1)
                n_0_24_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_24_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_24_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_24_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_24", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_0_27_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_27_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_27_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_27_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_27_STATE.outTemplates[0])
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
                n_0_27_STATE.outMessages[0] = message
                n_0_27_STATE.messageTransferFunctions.splice(0, n_0_27_STATE.messageTransferFunctions.length - 1)
                n_0_27_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_27_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_27_STATE.messageTransferFunctions.length; i++) {
                    n_1_17_RCVS_1(n_0_27_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_27", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_1_17_OUTS_0 = 0
function n_1_17_RCVS_1(m) {
                                
                            n_1_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_1_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_28_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_28_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_28_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_28_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_28_STATE.outTemplates[0])
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
                n_0_28_STATE.outMessages[0] = message
                n_0_28_STATE.messageTransferFunctions.splice(0, n_0_28_STATE.messageTransferFunctions.length - 1)
                n_0_28_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_28_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_28_STATE.messageTransferFunctions.length; i++) {
                    n_3_17_RCVS_1(n_0_28_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_28", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_3_17_OUTS_0 = 0
function n_3_17_RCVS_1(m) {
                                
                            n_3_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_3_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_29_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_29_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_29_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_29_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_29_STATE.outTemplates[0])
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
                n_0_29_STATE.outMessages[0] = message
                n_0_29_STATE.messageTransferFunctions.splice(0, n_0_29_STATE.messageTransferFunctions.length - 1)
                n_0_29_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_29_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_29_STATE.messageTransferFunctions.length; i++) {
                    n_5_17_RCVS_1(n_0_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_5_17_OUTS_0 = 0
function n_5_17_RCVS_1(m) {
                                
                            n_5_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_5_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_30_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_30_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_30_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_30_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_30_STATE.outTemplates[0])
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
                n_0_30_STATE.outMessages[0] = message
                n_0_30_STATE.messageTransferFunctions.splice(0, n_0_30_STATE.messageTransferFunctions.length - 1)
                n_0_30_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_30_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_30_STATE.messageTransferFunctions.length; i++) {
                    n_7_17_RCVS_1(n_0_30_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_30", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_7_17_OUTS_0 = 0
function n_7_17_RCVS_1(m) {
                                
                            n_7_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_7_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_31_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_31_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_31_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_31_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_31_STATE.outTemplates[0])
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
                n_0_31_STATE.outMessages[0] = message
                n_0_31_STATE.messageTransferFunctions.splice(0, n_0_31_STATE.messageTransferFunctions.length - 1)
                n_0_31_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_31_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_31_STATE.messageTransferFunctions.length; i++) {
                    n_9_17_RCVS_1(n_0_31_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_31", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_9_17_OUTS_0 = 0
function n_9_17_RCVS_1(m) {
                                
                            n_9_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_9_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_32_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_32_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_32_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_32_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_32_STATE.outTemplates[0])
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
                n_0_32_STATE.outMessages[0] = message
                n_0_32_STATE.messageTransferFunctions.splice(0, n_0_32_STATE.messageTransferFunctions.length - 1)
                n_0_32_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_32_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_32_STATE.messageTransferFunctions.length; i++) {
                    n_11_17_RCVS_1(n_0_32_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_32", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_11_17_OUTS_0 = 0
function n_11_17_RCVS_1(m) {
                                
                            n_11_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_11_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_1_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_1_7_STATE, msg_readFloatToken(m, 0))
                n_1_2_RCVS_1(msg_floats([n_1_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_1_2_RCVS_1(msg_floats([n_1_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_1_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_2_RCVS_0(m) {
                                
        if (!n_1_2_STATE.isClosed) {
            m_n_1_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_1_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_1_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_1_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_1_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_1_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_1_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_1_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_1_8_RCVS_0(msg_floats([n_1_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_1_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_1_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_1_8_STATE.currentValue) {
                    n_1_8_STATE.currentValue = newValue
                    n_1_11_RCVS_0(msg_floats([n_1_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_1_11_RCVS_0(msg_floats([n_1_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_1_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_11_RCVS_0(m) {
                                
        n_2_0_RCVS_0(msg_bang())
n_1_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_1_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_10_RCVS_0(m) {
                                
        if (!n_1_10_STATE.isClosed) {
            n_1_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_1_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_1_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_1_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_1_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_1_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_1_13_STATE.currentValue) {
                    n_1_13_STATE.currentValue = newValue
                    n_1_9_RCVS_0(msg_floats([n_1_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_1_9_RCVS_0(msg_floats([n_1_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_1_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_9_RCVS_0(m) {
                                
                if (n_1_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_1_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_1_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_1_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_1_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_1_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_1_9_STATE.stringFilter
                    ) {
                        n_1_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_1_9_STATE.floatFilter
                ) {
                    n_1_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_1_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_3_RCVS_0(m) {
                                
        n_1_5_RCVS_0(msg_bang())
n_0_16_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_1_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_5_RCVS_0(m) {
                                
        n_1_4_RCVS_0(msg_bang())
n_1_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_1_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_1_14_STATE, 
                            () => n_1_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_1_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_1_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_1_14_STATE,
                        () => n_1_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_1_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_1_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_6_STATE.outTemplates[0])
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
                n_1_6_STATE.outMessages[0] = message
                n_1_6_STATE.messageTransferFunctions.splice(0, n_1_6_STATE.messageTransferFunctions.length - 1)
                n_1_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_6_STATE.messageTransferFunctions.length; i++) {
                    n_1_7_RCVS_0(n_1_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_4_STATE.outTemplates[0])
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
                n_1_4_STATE.outMessages[0] = message
                n_1_4_STATE.messageTransferFunctions.splice(0, n_1_4_STATE.messageTransferFunctions.length - 1)
                n_1_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_4_STATE.messageTransferFunctions.length; i++) {
                    n_1_7_RCVS_0(n_1_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_0_RCVS_0(m) {
                                
        n_2_6_RCVS_0(msg_bang())
n_2_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_2_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_2_2_STATE, 
                            () => n_2_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_2_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_2_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_2_2_STATE,
                        () => n_2_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_2_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_2_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_2_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_2_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_2_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_2_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_2_5_STATE.outTemplates[0])
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
                n_2_5_STATE.outMessages[0] = message
                n_2_5_STATE.messageTransferFunctions.splice(0, n_2_5_STATE.messageTransferFunctions.length - 1)
                n_2_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_2_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_2_5_STATE.messageTransferFunctions.length; i++) {
                    n_2_1_RCVS_0(n_2_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_2_1_STATE, msg_readFloatToken(m, 0))
                n_1_10_RCVS_1(msg_floats([n_2_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_1_10_RCVS_1(msg_floats([n_2_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_2_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_2_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_2_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_2_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_2_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_2_6_STATE.outTemplates[0])
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
                n_2_6_STATE.outMessages[0] = message
                n_2_6_STATE.messageTransferFunctions.splice(0, n_2_6_STATE.messageTransferFunctions.length - 1)
                n_2_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_2_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_2_6_STATE.messageTransferFunctions.length; i++) {
                    n_2_1_RCVS_0(n_2_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_3_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_3_7_STATE, msg_readFloatToken(m, 0))
                n_3_2_RCVS_1(msg_floats([n_3_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_3_2_RCVS_1(msg_floats([n_3_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_3_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_2_RCVS_0(m) {
                                
        if (!n_3_2_STATE.isClosed) {
            m_n_3_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_3_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_3_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_3_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_3_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_3_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_3_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_3_8_RCVS_0(msg_floats([n_3_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_3_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_3_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_3_8_STATE.currentValue) {
                    n_3_8_STATE.currentValue = newValue
                    n_3_11_RCVS_0(msg_floats([n_3_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_3_11_RCVS_0(msg_floats([n_3_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_3_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_11_RCVS_0(m) {
                                
        n_4_0_RCVS_0(msg_bang())
n_3_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_3_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_10_RCVS_0(m) {
                                
        if (!n_3_10_STATE.isClosed) {
            n_3_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_3_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_3_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_3_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_3_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_3_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_3_13_STATE.currentValue) {
                    n_3_13_STATE.currentValue = newValue
                    n_3_9_RCVS_0(msg_floats([n_3_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_3_9_RCVS_0(msg_floats([n_3_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_3_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_9_RCVS_0(m) {
                                
                if (n_3_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_3_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_3_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_3_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_3_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_3_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_3_9_STATE.stringFilter
                    ) {
                        n_3_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_3_9_STATE.floatFilter
                ) {
                    n_3_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_3_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_3_RCVS_0(m) {
                                
        n_3_5_RCVS_0(msg_bang())
n_0_0_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_3_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_5_RCVS_0(m) {
                                
        n_3_4_RCVS_0(msg_bang())
n_3_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_3_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_3_14_STATE, 
                            () => n_3_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_3_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_3_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_3_14_STATE,
                        () => n_3_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_3_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_3_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_6_STATE.outTemplates[0])
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
                n_3_6_STATE.outMessages[0] = message
                n_3_6_STATE.messageTransferFunctions.splice(0, n_3_6_STATE.messageTransferFunctions.length - 1)
                n_3_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_6_STATE.messageTransferFunctions.length; i++) {
                    n_3_7_RCVS_0(n_3_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_4_STATE.outTemplates[0])
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
                n_3_4_STATE.outMessages[0] = message
                n_3_4_STATE.messageTransferFunctions.splice(0, n_3_4_STATE.messageTransferFunctions.length - 1)
                n_3_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_4_STATE.messageTransferFunctions.length; i++) {
                    n_3_7_RCVS_0(n_3_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_0_RCVS_0(m) {
                                
        n_4_6_RCVS_0(msg_bang())
n_4_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_4_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_4_2_STATE, 
                            () => n_4_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_4_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_4_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_4_2_STATE,
                        () => n_4_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_4_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_4_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_5_STATE.outTemplates[0])
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
                n_4_5_STATE.outMessages[0] = message
                n_4_5_STATE.messageTransferFunctions.splice(0, n_4_5_STATE.messageTransferFunctions.length - 1)
                n_4_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_5_STATE.messageTransferFunctions.length; i++) {
                    n_4_1_RCVS_0(n_4_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_4_1_STATE, msg_readFloatToken(m, 0))
                n_3_10_RCVS_1(msg_floats([n_4_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_3_10_RCVS_1(msg_floats([n_4_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_4_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_6_STATE.outTemplates[0])
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
                n_4_6_STATE.outMessages[0] = message
                n_4_6_STATE.messageTransferFunctions.splice(0, n_4_6_STATE.messageTransferFunctions.length - 1)
                n_4_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_6_STATE.messageTransferFunctions.length; i++) {
                    n_4_1_RCVS_0(n_4_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_5_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_5_7_STATE, msg_readFloatToken(m, 0))
                n_5_2_RCVS_1(msg_floats([n_5_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_5_2_RCVS_1(msg_floats([n_5_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_5_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_2_RCVS_0(m) {
                                
        if (!n_5_2_STATE.isClosed) {
            m_n_5_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_5_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_5_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_5_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_5_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_5_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_5_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_5_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_5_8_RCVS_0(msg_floats([n_5_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_5_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_5_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_5_8_STATE.currentValue) {
                    n_5_8_STATE.currentValue = newValue
                    n_5_11_RCVS_0(msg_floats([n_5_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_5_11_RCVS_0(msg_floats([n_5_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_5_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_11_RCVS_0(m) {
                                
        n_6_0_RCVS_0(msg_bang())
n_5_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_5_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_10_RCVS_0(m) {
                                
        if (!n_5_10_STATE.isClosed) {
            n_5_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_5_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_5_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_5_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_5_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_5_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_5_13_STATE.currentValue) {
                    n_5_13_STATE.currentValue = newValue
                    n_5_9_RCVS_0(msg_floats([n_5_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_5_9_RCVS_0(msg_floats([n_5_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_5_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_9_RCVS_0(m) {
                                
                if (n_5_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_5_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_5_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_5_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_5_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_5_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_5_9_STATE.stringFilter
                    ) {
                        n_5_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_5_9_STATE.floatFilter
                ) {
                    n_5_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_5_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_3_RCVS_0(m) {
                                
        n_5_5_RCVS_0(msg_bang())
n_0_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_5_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_5_RCVS_0(m) {
                                
        n_5_4_RCVS_0(msg_bang())
n_5_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_5_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_5_14_STATE, 
                            () => n_5_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_5_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_5_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_5_14_STATE,
                        () => n_5_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_5_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_5_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_6_STATE.outTemplates[0])
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
                n_5_6_STATE.outMessages[0] = message
                n_5_6_STATE.messageTransferFunctions.splice(0, n_5_6_STATE.messageTransferFunctions.length - 1)
                n_5_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_6_STATE.messageTransferFunctions.length; i++) {
                    n_5_7_RCVS_0(n_5_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_4_STATE.outTemplates[0])
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
                n_5_4_STATE.outMessages[0] = message
                n_5_4_STATE.messageTransferFunctions.splice(0, n_5_4_STATE.messageTransferFunctions.length - 1)
                n_5_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_4_STATE.messageTransferFunctions.length; i++) {
                    n_5_7_RCVS_0(n_5_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_0_RCVS_0(m) {
                                
        n_6_6_RCVS_0(msg_bang())
n_6_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_6_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_6_2_STATE, 
                            () => n_6_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_6_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_6_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_6_2_STATE,
                        () => n_6_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_6_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_6_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_5_STATE.outTemplates[0])
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
                n_6_5_STATE.outMessages[0] = message
                n_6_5_STATE.messageTransferFunctions.splice(0, n_6_5_STATE.messageTransferFunctions.length - 1)
                n_6_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_5_STATE.messageTransferFunctions.length; i++) {
                    n_6_1_RCVS_0(n_6_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_6_1_STATE, msg_readFloatToken(m, 0))
                n_5_10_RCVS_1(msg_floats([n_6_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_5_10_RCVS_1(msg_floats([n_6_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_6_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_6_STATE.outTemplates[0])
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
                n_6_6_STATE.outMessages[0] = message
                n_6_6_STATE.messageTransferFunctions.splice(0, n_6_6_STATE.messageTransferFunctions.length - 1)
                n_6_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_6_STATE.messageTransferFunctions.length; i++) {
                    n_6_1_RCVS_0(n_6_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_7_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_7_7_STATE, msg_readFloatToken(m, 0))
                n_7_2_RCVS_1(msg_floats([n_7_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_7_2_RCVS_1(msg_floats([n_7_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_7_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_2_RCVS_0(m) {
                                
        if (!n_7_2_STATE.isClosed) {
            m_n_7_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_7_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_7_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_7_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_7_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_7_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_7_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_7_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_7_8_RCVS_0(msg_floats([n_7_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_7_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_7_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_7_8_STATE.currentValue) {
                    n_7_8_STATE.currentValue = newValue
                    n_7_11_RCVS_0(msg_floats([n_7_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_7_11_RCVS_0(msg_floats([n_7_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_7_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_11_RCVS_0(m) {
                                
        n_8_0_RCVS_0(msg_bang())
n_7_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_7_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_10_RCVS_0(m) {
                                
        if (!n_7_10_STATE.isClosed) {
            n_7_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_7_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_7_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_7_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_7_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_7_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_7_13_STATE.currentValue) {
                    n_7_13_STATE.currentValue = newValue
                    n_7_9_RCVS_0(msg_floats([n_7_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_7_9_RCVS_0(msg_floats([n_7_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_7_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_9_RCVS_0(m) {
                                
                if (n_7_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_7_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_7_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_7_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_7_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_7_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_7_9_STATE.stringFilter
                    ) {
                        n_7_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_7_9_STATE.floatFilter
                ) {
                    n_7_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_7_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_3_RCVS_0(m) {
                                
        n_7_5_RCVS_0(msg_bang())
n_0_7_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_7_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_5_RCVS_0(m) {
                                
        n_7_4_RCVS_0(msg_bang())
n_7_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_7_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_7_14_STATE, 
                            () => n_7_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_7_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_7_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_7_14_STATE,
                        () => n_7_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_7_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_7_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_6_STATE.outTemplates[0])
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
                n_7_6_STATE.outMessages[0] = message
                n_7_6_STATE.messageTransferFunctions.splice(0, n_7_6_STATE.messageTransferFunctions.length - 1)
                n_7_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_6_STATE.messageTransferFunctions.length; i++) {
                    n_7_7_RCVS_0(n_7_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_7_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_7_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_7_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_7_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_7_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_7_4_STATE.outTemplates[0])
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
                n_7_4_STATE.outMessages[0] = message
                n_7_4_STATE.messageTransferFunctions.splice(0, n_7_4_STATE.messageTransferFunctions.length - 1)
                n_7_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_7_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_7_4_STATE.messageTransferFunctions.length; i++) {
                    n_7_7_RCVS_0(n_7_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_7_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_0_RCVS_0(m) {
                                
        n_8_6_RCVS_0(msg_bang())
n_8_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_8_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_8_2_STATE, 
                            () => n_8_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_8_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_8_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_8_2_STATE,
                        () => n_8_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_8_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_8_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_8_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_8_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_8_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_8_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_8_5_STATE.outTemplates[0])
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
                n_8_5_STATE.outMessages[0] = message
                n_8_5_STATE.messageTransferFunctions.splice(0, n_8_5_STATE.messageTransferFunctions.length - 1)
                n_8_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_8_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_8_5_STATE.messageTransferFunctions.length; i++) {
                    n_8_1_RCVS_0(n_8_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_8_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_8_1_STATE, msg_readFloatToken(m, 0))
                n_7_10_RCVS_1(msg_floats([n_8_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_7_10_RCVS_1(msg_floats([n_8_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_8_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_8_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_8_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_8_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_8_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_8_6_STATE.outTemplates[0])
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
                n_8_6_STATE.outMessages[0] = message
                n_8_6_STATE.messageTransferFunctions.splice(0, n_8_6_STATE.messageTransferFunctions.length - 1)
                n_8_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_8_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_8_6_STATE.messageTransferFunctions.length; i++) {
                    n_8_1_RCVS_0(n_8_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_8_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_9_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_9_7_STATE, msg_readFloatToken(m, 0))
                n_9_2_RCVS_1(msg_floats([n_9_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_9_2_RCVS_1(msg_floats([n_9_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_9_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_2_RCVS_0(m) {
                                
        if (!n_9_2_STATE.isClosed) {
            m_n_9_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_9_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_9_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_9_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_9_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_9_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_9_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_9_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_9_8_RCVS_0(msg_floats([n_9_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_9_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_9_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_9_8_STATE.currentValue) {
                    n_9_8_STATE.currentValue = newValue
                    n_9_11_RCVS_0(msg_floats([n_9_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_9_11_RCVS_0(msg_floats([n_9_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_9_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_9_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_11_RCVS_0(m) {
                                
        n_10_0_RCVS_0(msg_bang())
n_9_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_9_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_10_RCVS_0(m) {
                                
        if (!n_9_10_STATE.isClosed) {
            n_9_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_9_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_9_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_9_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_9_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_9_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_9_13_STATE.currentValue) {
                    n_9_13_STATE.currentValue = newValue
                    n_9_9_RCVS_0(msg_floats([n_9_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_9_9_RCVS_0(msg_floats([n_9_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_9_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_9_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_9_RCVS_0(m) {
                                
                if (n_9_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_9_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_9_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_9_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_9_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_9_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_9_9_STATE.stringFilter
                    ) {
                        n_9_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_9_9_STATE.floatFilter
                ) {
                    n_9_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_9_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_3_RCVS_0(m) {
                                
        n_9_5_RCVS_0(msg_bang())
n_0_11_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_9_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_5_RCVS_0(m) {
                                
        n_9_4_RCVS_0(msg_bang())
n_9_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_9_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_9_14_STATE, 
                            () => n_9_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_9_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_9_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_9_14_STATE,
                        () => n_9_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_9_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_9_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_9_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_9_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_9_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_9_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_9_6_STATE.outTemplates[0])
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
                n_9_6_STATE.outMessages[0] = message
                n_9_6_STATE.messageTransferFunctions.splice(0, n_9_6_STATE.messageTransferFunctions.length - 1)
                n_9_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_9_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_9_6_STATE.messageTransferFunctions.length; i++) {
                    n_9_7_RCVS_0(n_9_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_9_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_9_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_9_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_9_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_9_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_9_4_STATE.outTemplates[0])
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
                n_9_4_STATE.outMessages[0] = message
                n_9_4_STATE.messageTransferFunctions.splice(0, n_9_4_STATE.messageTransferFunctions.length - 1)
                n_9_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_9_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_9_4_STATE.messageTransferFunctions.length; i++) {
                    n_9_7_RCVS_0(n_9_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_9_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_0_RCVS_0(m) {
                                
        n_10_6_RCVS_0(msg_bang())
n_10_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_10_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_10_2_STATE, 
                            () => n_10_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_10_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_10_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_10_2_STATE,
                        () => n_10_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_10_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_10_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_10_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_10_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_10_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_10_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_10_5_STATE.outTemplates[0])
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
                n_10_5_STATE.outMessages[0] = message
                n_10_5_STATE.messageTransferFunctions.splice(0, n_10_5_STATE.messageTransferFunctions.length - 1)
                n_10_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_10_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_10_5_STATE.messageTransferFunctions.length; i++) {
                    n_10_1_RCVS_0(n_10_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_10_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_10_1_STATE, msg_readFloatToken(m, 0))
                n_9_10_RCVS_1(msg_floats([n_10_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_9_10_RCVS_1(msg_floats([n_10_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_10_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_10_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_10_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_10_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_10_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_10_6_STATE.outTemplates[0])
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
                n_10_6_STATE.outMessages[0] = message
                n_10_6_STATE.messageTransferFunctions.splice(0, n_10_6_STATE.messageTransferFunctions.length - 1)
                n_10_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_10_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_10_6_STATE.messageTransferFunctions.length; i++) {
                    n_10_1_RCVS_0(n_10_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_10_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_11_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_11_7_STATE, msg_readFloatToken(m, 0))
                n_11_2_RCVS_1(msg_floats([n_11_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_11_2_RCVS_1(msg_floats([n_11_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_11_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_2_RCVS_0(m) {
                                
        if (!n_11_2_STATE.isClosed) {
            m_n_11_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_11_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_11_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_11_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_11_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_11_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_11_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_11_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_11_8_RCVS_0(msg_floats([n_11_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_11_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_11_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_11_8_STATE.currentValue) {
                    n_11_8_STATE.currentValue = newValue
                    n_11_11_RCVS_0(msg_floats([n_11_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_11_11_RCVS_0(msg_floats([n_11_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_11_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_11_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_11_RCVS_0(m) {
                                
        n_12_0_RCVS_0(msg_bang())
n_11_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_11_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_10_RCVS_0(m) {
                                
        if (!n_11_10_STATE.isClosed) {
            n_11_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_11_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_11_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_11_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_11_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_11_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_11_13_STATE.currentValue) {
                    n_11_13_STATE.currentValue = newValue
                    n_11_9_RCVS_0(msg_floats([n_11_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_11_9_RCVS_0(msg_floats([n_11_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_11_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_11_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_9_RCVS_0(m) {
                                
                if (n_11_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_11_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_11_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_11_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_11_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_11_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_11_9_STATE.stringFilter
                    ) {
                        n_11_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_11_9_STATE.floatFilter
                ) {
                    n_11_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_11_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_3_RCVS_0(m) {
                                
        n_11_5_RCVS_0(msg_bang())
n_0_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_11_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_5_RCVS_0(m) {
                                
        n_11_4_RCVS_0(msg_bang())
n_11_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_11_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_11_14_STATE, 
                            () => n_11_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_11_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_11_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_11_14_STATE,
                        () => n_11_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_11_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_11_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_11_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_11_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_11_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_11_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_11_6_STATE.outTemplates[0])
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
                n_11_6_STATE.outMessages[0] = message
                n_11_6_STATE.messageTransferFunctions.splice(0, n_11_6_STATE.messageTransferFunctions.length - 1)
                n_11_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_11_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_11_6_STATE.messageTransferFunctions.length; i++) {
                    n_11_7_RCVS_0(n_11_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_11_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_11_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_11_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_11_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_11_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_11_4_STATE.outTemplates[0])
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
                n_11_4_STATE.outMessages[0] = message
                n_11_4_STATE.messageTransferFunctions.splice(0, n_11_4_STATE.messageTransferFunctions.length - 1)
                n_11_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_11_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_11_4_STATE.messageTransferFunctions.length; i++) {
                    n_11_7_RCVS_0(n_11_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_11_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_0_RCVS_0(m) {
                                
        n_12_6_RCVS_0(msg_bang())
n_12_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_12_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_12_2_STATE, 
                            () => n_12_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_12_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_12_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_12_2_STATE,
                        () => n_12_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_12_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_12_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_12_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_12_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_12_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_12_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_12_5_STATE.outTemplates[0])
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
                n_12_5_STATE.outMessages[0] = message
                n_12_5_STATE.messageTransferFunctions.splice(0, n_12_5_STATE.messageTransferFunctions.length - 1)
                n_12_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_12_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_12_5_STATE.messageTransferFunctions.length; i++) {
                    n_12_1_RCVS_0(n_12_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_12_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_12_1_STATE, msg_readFloatToken(m, 0))
                n_11_10_RCVS_1(msg_floats([n_12_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_11_10_RCVS_1(msg_floats([n_12_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_12_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_12_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_12_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_12_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_12_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_12_6_STATE.outTemplates[0])
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
                n_12_6_STATE.outMessages[0] = message
                n_12_6_STATE.messageTransferFunctions.splice(0, n_12_6_STATE.messageTransferFunctions.length - 1)
                n_12_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_12_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_12_6_STATE.messageTransferFunctions.length; i++) {
                    n_12_1_RCVS_0(n_12_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_12_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

























function n_0_36_SNDS_0(m) {
                    n_0_8_RCVS_0(m)
n_0_10_RCVS_0(m)
                }



















function n_0_26_SNDS_0(m) {
                    n_0_27_RCVS_0(m)
n_0_28_RCVS_0(m)
n_0_29_RCVS_0(m)
n_0_30_RCVS_0(m)
n_0_31_RCVS_0(m)
n_0_32_RCVS_0(m)
                }

















































































































































        

        function ioRcv_n_0_0_0(m) {n_0_0_RCVS_0(m)}
function ioRcv_n_0_2_0(m) {n_0_2_RCVS_0(m)}
function ioRcv_n_0_4_0(m) {n_0_4_RCVS_0(m)}
function ioRcv_n_0_6_0(m) {n_0_6_RCVS_0(m)}
function ioRcv_n_0_7_0(m) {n_0_7_RCVS_0(m)}
function ioRcv_n_0_9_0(m) {n_0_9_RCVS_0(m)}
function ioRcv_n_0_10_0(m) {n_0_10_RCVS_0(m)}
function ioRcv_n_0_11_0(m) {n_0_11_RCVS_0(m)}
function ioRcv_n_0_13_0(m) {n_0_13_RCVS_0(m)}
function ioRcv_n_0_16_0(m) {n_0_16_RCVS_0(m)}
function ioRcv_n_0_18_0(m) {n_0_18_RCVS_0(m)}
function ioRcv_n_0_19_0(m) {n_0_19_RCVS_0(m)}
function ioRcv_n_0_21_0(m) {n_0_21_RCVS_0(m)}
function ioRcv_n_0_22_0(m) {n_0_22_RCVS_0(m)}
function ioRcv_n_0_23_0(m) {n_0_23_RCVS_0(m)}
function ioRcv_n_0_24_0(m) {n_0_24_RCVS_0(m)}
function ioRcv_n_0_27_0(m) {n_0_27_RCVS_0(m)}
function ioRcv_n_0_28_0(m) {n_0_28_RCVS_0(m)}
function ioRcv_n_0_29_0(m) {n_0_29_RCVS_0(m)}
function ioRcv_n_0_30_0(m) {n_0_30_RCVS_0(m)}
function ioRcv_n_0_31_0(m) {n_0_31_RCVS_0(m)}
function ioRcv_n_0_32_0(m) {n_0_32_RCVS_0(m)}
        

        
        const n_0_0_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_0_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_0_STATE, m)
            }
            n_0_0_STATE.messageSender = n_0_34_RCVS_0
            n_control_setReceiveBusName(n_0_0_STATE, "empty")
        })

        
    

        const n_0_34_STATE = {
            maxValue: 8
        }
    

        const n_0_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_2_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_2_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_2_STATE, m)
            }
            n_0_2_STATE.messageSender = SND_TO_NULL
            n_control_setReceiveBusName(n_0_2_STATE, "empty")
        })

        
    

        const n_0_4_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_4_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_4_STATE, m)
            }
            n_0_4_STATE.messageSender = n_0_35_RCVS_0
            n_control_setReceiveBusName(n_0_4_STATE, "empty")
        })

        
    

        const n_0_35_STATE = {
            maxValue: 6
        }
    

        const n_0_5_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_6_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_6_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_6_STATE, m)
            }
            n_0_6_STATE.messageSender = SND_TO_NULL
            n_control_setReceiveBusName(n_0_6_STATE, "empty")
        })

        
    

        const n_0_7_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_7_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_7_STATE, m)
            }
            n_0_7_STATE.messageSender = n_0_36_RCVS_0
            n_control_setReceiveBusName(n_0_7_STATE, "empty")
        })

        
    

        const n_0_36_STATE = {
            maxValue: 6
        }
    

        const n_0_8_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_9_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_9_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_9_STATE, m)
            }
            n_0_9_STATE.messageSender = SND_TO_NULL
            n_control_setReceiveBusName(n_0_9_STATE, "empty")
        })

        
    

            const n_0_10_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_10_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_10_STATE, m)
                }
                n_0_10_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_0_10_STATE, "empty")
            })
        

        const n_0_11_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_11_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_11_STATE, m)
            }
            n_0_11_STATE.messageSender = n_0_37_RCVS_0
            n_control_setReceiveBusName(n_0_11_STATE, "empty")
        })

        
    

        const n_0_37_STATE = {
            maxValue: 2
        }
    

        const n_0_12_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_13_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_13_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_13_STATE, m)
            }
            n_0_13_STATE.messageSender = SND_TO_NULL
            n_control_setReceiveBusName(n_0_13_STATE, "empty")
        })

        
    

        const n_0_16_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_16_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_16_STATE, m)
            }
            n_0_16_STATE.messageSender = n_0_33_RCVS_0
            n_control_setReceiveBusName(n_0_16_STATE, "empty")
        })

        
    

        const n_0_33_STATE = {
            maxValue: 8
        }
    

        const n_0_17_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_18_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_18_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_18_STATE, m)
            }
            n_0_18_STATE.messageSender = SND_TO_NULL
            n_control_setReceiveBusName(n_0_18_STATE, "empty")
        })

        
    

        const n_0_19_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_19_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_19_STATE, m)
            }
            n_0_19_STATE.messageSender = n_0_38_RCVS_0
            n_control_setReceiveBusName(n_0_19_STATE, "empty")
        })

        
    

        const n_0_38_STATE = {
            maxValue: 12
        }
    

        const n_0_20_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_21_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_21_STATE.outTemplates[0] = []
            
                n_0_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_21_STATE.outMessages[0] = msg_create(n_0_21_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_21_STATE.outMessages[0], 0, 0)
            
        
        
        n_0_21_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_21_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_22_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_22_STATE.outTemplates[0] = []
            
                n_0_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_22_STATE.outMessages[0] = msg_create(n_0_22_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_22_STATE.outMessages[0], 0, 0.25)
            
        
        
        n_0_22_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_22_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_23_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_23_STATE.outTemplates[0] = []
            
                n_0_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_23_STATE.outMessages[0] = msg_create(n_0_23_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_23_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_0_23_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_23_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_24_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_24_STATE.outTemplates[0] = []
            
                n_0_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_24_STATE.outMessages[0] = msg_create(n_0_24_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_24_STATE.outMessages[0], 0, 0.75)
            
        
        
        n_0_24_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_24_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("startBang", n_0_21_RCVS_0)
            })
        
commons_waitFrame(0, () => n_0_26_SNDS_0(msg_bang()))

        const n_0_27_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_27_STATE.outTemplates[0] = []
            
                n_0_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_27_STATE.outMessages[0] = msg_create(n_0_27_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_27_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_0_27_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_27_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_1_17_STATE.floatInputs.set(1, 0)
        
    

        const n_0_28_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_28_STATE.outTemplates[0] = []
            
                n_0_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_28_STATE.outMessages[0] = msg_create(n_0_28_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_28_STATE.outMessages[0], 0, 0.9)
            
        
        
        n_0_28_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_28_STATE.outMessages[0]
                }
,
        ]
    

        const n_3_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_3_17_STATE.floatInputs.set(1, 0)
        
    

        const n_0_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_29_STATE.outTemplates[0] = []
            
                n_0_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_29_STATE.outMessages[0] = msg_create(n_0_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_29_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_0_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_29_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_5_17_STATE.floatInputs.set(1, 0)
        
    

        const n_0_30_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_30_STATE.outTemplates[0] = []
            
                n_0_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_30_STATE.outMessages[0] = msg_create(n_0_30_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_30_STATE.outMessages[0], 0, 0.2)
            
        
        
        n_0_30_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_30_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_7_17_STATE.floatInputs.set(1, 0)
        
    

        const n_0_31_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_31_STATE.outTemplates[0] = []
            
                n_0_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_31_STATE.outMessages[0] = msg_create(n_0_31_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_31_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_0_31_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_31_STATE.outMessages[0]
                }
,
        ]
    

        const n_9_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_9_17_STATE.floatInputs.set(1, 0)
        
    

        const n_0_32_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_32_STATE.outTemplates[0] = []
            
                n_0_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_32_STATE.outMessages[0] = msg_create(n_0_32_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_32_STATE.outMessages[0], 0, 0.4)
            
        
        
        n_0_32_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_32_STATE.outMessages[0]
                }
,
        ]
    

        const n_11_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_11_17_STATE.floatInputs.set(1, 0)
        
    

            const n_1_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_1_7_STATE, 0)
        

        const n_1_2_STATE = {
            isClosed: true
        }
    


        const n_1_1_STATE = {
            currentValue: 0
        }
    

            const n_1_8_STATE = {
                currentValue: 0
            }
        


        const n_1_10_STATE = {
            isClosed: true
        }
    

            const n_1_13_STATE = {
                currentValue: 0
            }
        

        const n_1_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_1_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_1_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_1_14_STATE, 1200)
        })
    

        const n_1_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_6_STATE.outTemplates[0] = []
            
                n_1_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_6_STATE.outMessages[0] = msg_create(n_1_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_1_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_4_STATE.outTemplates[0] = []
            
                n_1_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_4_STATE.outMessages[0] = msg_create(n_1_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_1_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_2_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_2_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_2_2_STATE, 1000)
        })
    

        const n_2_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_5_STATE.outTemplates[0] = []
            
                n_2_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_5_STATE.outMessages[0] = msg_create(n_2_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_2_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_2_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_2_1_STATE, 0)
        

        const n_2_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_6_STATE.outTemplates[0] = []
            
                n_2_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_6_STATE.outMessages[0] = msg_create(n_2_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_2_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_1_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_1_6_RCVS_0(msg_bang()))

            const n_3_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_3_7_STATE, 0)
        

        const n_3_2_STATE = {
            isClosed: true
        }
    


        const n_3_1_STATE = {
            currentValue: 0
        }
    

            const n_3_8_STATE = {
                currentValue: 0
            }
        


        const n_3_10_STATE = {
            isClosed: true
        }
    

            const n_3_13_STATE = {
                currentValue: 0
            }
        

        const n_3_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_3_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_3_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_3_14_STATE, 1200)
        })
    

        const n_3_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_3_6_STATE.outTemplates[0] = []
            
                n_3_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_6_STATE.outMessages[0] = msg_create(n_3_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_3_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_3_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_3_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_3_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_3_4_STATE.outTemplates[0] = []
            
                n_3_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_4_STATE.outMessages[0] = msg_create(n_3_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_3_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_3_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_3_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_4_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_4_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_4_2_STATE, 1000)
        })
    

        const n_4_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_5_STATE.outTemplates[0] = []
            
                n_4_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_5_STATE.outMessages[0] = msg_create(n_4_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_4_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_4_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_4_1_STATE, 0)
        

        const n_4_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_6_STATE.outTemplates[0] = []
            
                n_4_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_6_STATE.outMessages[0] = msg_create(n_4_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_4_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_3_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_3_6_RCVS_0(msg_bang()))

            const n_5_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_5_7_STATE, 0)
        

        const n_5_2_STATE = {
            isClosed: true
        }
    


        const n_5_1_STATE = {
            currentValue: 0
        }
    

            const n_5_8_STATE = {
                currentValue: 0
            }
        


        const n_5_10_STATE = {
            isClosed: true
        }
    

            const n_5_13_STATE = {
                currentValue: 0
            }
        

        const n_5_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_5_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_5_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_5_14_STATE, 1200)
        })
    

        const n_5_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_5_6_STATE.outTemplates[0] = []
            
                n_5_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_5_6_STATE.outMessages[0] = msg_create(n_5_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_5_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_5_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_5_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_5_4_STATE.outTemplates[0] = []
            
                n_5_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_5_4_STATE.outMessages[0] = msg_create(n_5_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_5_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_5_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_5_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_6_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_6_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_6_2_STATE, 1000)
        })
    

        const n_6_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_5_STATE.outTemplates[0] = []
            
                n_6_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_6_5_STATE.outMessages[0] = msg_create(n_6_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_6_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_6_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_6_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_6_1_STATE, 0)
        

        const n_6_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_6_STATE.outTemplates[0] = []
            
                n_6_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_6_6_STATE.outMessages[0] = msg_create(n_6_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_6_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_6_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_5_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_5_6_RCVS_0(msg_bang()))

            const n_7_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_7_7_STATE, 0)
        

        const n_7_2_STATE = {
            isClosed: true
        }
    


        const n_7_1_STATE = {
            currentValue: 0
        }
    

            const n_7_8_STATE = {
                currentValue: 0
            }
        


        const n_7_10_STATE = {
            isClosed: true
        }
    

            const n_7_13_STATE = {
                currentValue: 0
            }
        

        const n_7_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_7_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_7_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_7_14_STATE, 1200)
        })
    

        const n_7_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_6_STATE.outTemplates[0] = []
            
                n_7_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_7_6_STATE.outMessages[0] = msg_create(n_7_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_7_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_7_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_7_4_STATE.outTemplates[0] = []
            
                n_7_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_7_4_STATE.outMessages[0] = msg_create(n_7_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_7_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_7_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_7_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_8_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_8_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_8_2_STATE, 1000)
        })
    

        const n_8_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_8_5_STATE.outTemplates[0] = []
            
                n_8_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_8_5_STATE.outMessages[0] = msg_create(n_8_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_8_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_8_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_8_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_8_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_8_1_STATE, 0)
        

        const n_8_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_8_6_STATE.outTemplates[0] = []
            
                n_8_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_8_6_STATE.outMessages[0] = msg_create(n_8_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_8_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_8_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_8_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_7_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_7_6_RCVS_0(msg_bang()))

            const n_9_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_9_7_STATE, 0)
        

        const n_9_2_STATE = {
            isClosed: true
        }
    


        const n_9_1_STATE = {
            currentValue: 0
        }
    

            const n_9_8_STATE = {
                currentValue: 0
            }
        


        const n_9_10_STATE = {
            isClosed: true
        }
    

            const n_9_13_STATE = {
                currentValue: 0
            }
        

        const n_9_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_9_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_9_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_9_14_STATE, 1200)
        })
    

        const n_9_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_9_6_STATE.outTemplates[0] = []
            
                n_9_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_9_6_STATE.outMessages[0] = msg_create(n_9_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_9_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_9_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_9_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_9_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_9_4_STATE.outTemplates[0] = []
            
                n_9_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_9_4_STATE.outMessages[0] = msg_create(n_9_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_9_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_9_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_9_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_10_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_10_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_10_2_STATE, 1000)
        })
    

        const n_10_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_10_5_STATE.outTemplates[0] = []
            
                n_10_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_10_5_STATE.outMessages[0] = msg_create(n_10_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_10_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_10_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_10_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_10_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_10_1_STATE, 0)
        

        const n_10_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_10_6_STATE.outTemplates[0] = []
            
                n_10_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_10_6_STATE.outMessages[0] = msg_create(n_10_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_10_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_10_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_10_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_9_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_9_6_RCVS_0(msg_bang()))

            const n_11_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_11_7_STATE, 0)
        

        const n_11_2_STATE = {
            isClosed: true
        }
    


        const n_11_1_STATE = {
            currentValue: 0
        }
    

            const n_11_8_STATE = {
                currentValue: 0
            }
        


        const n_11_10_STATE = {
            isClosed: true
        }
    

            const n_11_13_STATE = {
                currentValue: 0
            }
        

        const n_11_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_11_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_11_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_11_14_STATE, 1200)
        })
    

        const n_11_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_11_6_STATE.outTemplates[0] = []
            
                n_11_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_11_6_STATE.outMessages[0] = msg_create(n_11_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_11_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_11_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_11_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_11_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_11_4_STATE.outTemplates[0] = []
            
                n_11_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_11_4_STATE.outMessages[0] = msg_create(n_11_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_11_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_11_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_11_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_12_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_12_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_12_2_STATE, 1000)
        })
    

        const n_12_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_12_5_STATE.outTemplates[0] = []
            
                n_12_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_12_5_STATE.outMessages[0] = msg_create(n_12_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_12_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_12_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_12_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_12_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_12_1_STATE, 0)
        

        const n_12_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_12_6_STATE.outTemplates[0] = []
            
                n_12_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_12_6_STATE.outMessages[0] = msg_create(n_12_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_12_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_12_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_12_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_11_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_11_6_RCVS_0(msg_bang()))

            const m_n_1_17_0_sig_STATE = {
                currentValue: 0
            }
        

            const m_n_3_17_0_sig_STATE = {
                currentValue: 0
            }
        

            const m_n_5_17_0_sig_STATE = {
                currentValue: 0
            }
        

            const m_n_7_17_0_sig_STATE = {
                currentValue: 0
            }
        

            const m_n_9_17_0_sig_STATE = {
                currentValue: 0
            }
        

            const m_n_11_17_0_sig_STATE = {
                currentValue: 0
            }
        

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_0":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[370,397]}},"n_0_2":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[370,490]}},"n_0_4":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[557,397]}},"n_0_6":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[557,490]}},"n_0_7":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[750,397]}},"n_0_9":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[750,490]}},"n_0_10":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"empty","position":[803,460]}},"n_0_11":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[936,397]}},"n_0_13":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[936,490]}},"n_0_16":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[188,397]}},"n_0_18":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[188,490]}},"n_0_19":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[1127,397]}},"n_0_21":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1127,484]}},"n_0_22":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1164,484]}},"n_0_23":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1224,484]}},"n_0_24":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1274,484]}},"n_0_27":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[246,336]}},"n_0_28":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[428,336]}},"n_0_29":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[615,336]}},"n_0_30":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[808,336]}},"n_0_31":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[994,336]}},"n_0_32":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1185,336]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_0":{"0":"ioRcv_n_0_0_0"},"n_0_2":{"0":"ioRcv_n_0_2_0"},"n_0_4":{"0":"ioRcv_n_0_4_0"},"n_0_6":{"0":"ioRcv_n_0_6_0"},"n_0_7":{"0":"ioRcv_n_0_7_0"},"n_0_9":{"0":"ioRcv_n_0_9_0"},"n_0_10":{"0":"ioRcv_n_0_10_0"},"n_0_11":{"0":"ioRcv_n_0_11_0"},"n_0_13":{"0":"ioRcv_n_0_13_0"},"n_0_16":{"0":"ioRcv_n_0_16_0"},"n_0_18":{"0":"ioRcv_n_0_18_0"},"n_0_19":{"0":"ioRcv_n_0_19_0"},"n_0_21":{"0":"ioRcv_n_0_21_0"},"n_0_22":{"0":"ioRcv_n_0_22_0"},"n_0_23":{"0":"ioRcv_n_0_23_0"},"n_0_24":{"0":"ioRcv_n_0_24_0"},"n_0_27":{"0":"ioRcv_n_0_27_0"},"n_0_28":{"0":"ioRcv_n_0_28_0"},"n_0_29":{"0":"ioRcv_n_0_29_0"},"n_0_30":{"0":"ioRcv_n_0_30_0"},"n_0_31":{"0":"ioRcv_n_0_31_0"},"n_0_32":{"0":"ioRcv_n_0_32_0"}},"messageSenders":{}}}}},
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
            n_1_17_OUTS_0 = +(m_n_1_17_0_sig_STATE.currentValue >= n_1_17_STATE.floatInputs.get(1))

    n_1_1_STATE.currentValue = n_1_17_OUTS_0

n_3_17_OUTS_0 = +(m_n_3_17_0_sig_STATE.currentValue >= n_3_17_STATE.floatInputs.get(1))

    n_3_1_STATE.currentValue = n_3_17_OUTS_0

n_5_17_OUTS_0 = +(m_n_5_17_0_sig_STATE.currentValue >= n_5_17_STATE.floatInputs.get(1))

    n_5_1_STATE.currentValue = n_5_17_OUTS_0

n_7_17_OUTS_0 = +(m_n_7_17_0_sig_STATE.currentValue >= n_7_17_STATE.floatInputs.get(1))

    n_7_1_STATE.currentValue = n_7_17_OUTS_0

n_9_17_OUTS_0 = +(m_n_9_17_0_sig_STATE.currentValue >= n_9_17_STATE.floatInputs.get(1))

    n_9_1_STATE.currentValue = n_9_17_OUTS_0

n_11_17_OUTS_0 = +(m_n_11_17_0_sig_STATE.currentValue >= n_11_17_STATE.floatInputs.get(1))

    n_11_1_STATE.currentValue = n_11_17_OUTS_0

            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_0: {
                            "0": ioRcv_n_0_0_0,
                        },
n_0_2: {
                            "0": ioRcv_n_0_2_0,
                        },
n_0_4: {
                            "0": ioRcv_n_0_4_0,
                        },
n_0_6: {
                            "0": ioRcv_n_0_6_0,
                        },
n_0_7: {
                            "0": ioRcv_n_0_7_0,
                        },
n_0_9: {
                            "0": ioRcv_n_0_9_0,
                        },
n_0_10: {
                            "0": ioRcv_n_0_10_0,
                        },
n_0_11: {
                            "0": ioRcv_n_0_11_0,
                        },
n_0_13: {
                            "0": ioRcv_n_0_13_0,
                        },
n_0_16: {
                            "0": ioRcv_n_0_16_0,
                        },
n_0_18: {
                            "0": ioRcv_n_0_18_0,
                        },
n_0_19: {
                            "0": ioRcv_n_0_19_0,
                        },
n_0_21: {
                            "0": ioRcv_n_0_21_0,
                        },
n_0_22: {
                            "0": ioRcv_n_0_22_0,
                        },
n_0_23: {
                            "0": ioRcv_n_0_23_0,
                        },
n_0_24: {
                            "0": ioRcv_n_0_24_0,
                        },
n_0_27: {
                            "0": ioRcv_n_0_27_0,
                        },
n_0_28: {
                            "0": ioRcv_n_0_28_0,
                        },
n_0_29: {
                            "0": ioRcv_n_0_29_0,
                        },
n_0_30: {
                            "0": ioRcv_n_0_30_0,
                        },
n_0_31: {
                            "0": ioRcv_n_0_31_0,
                        },
n_0_32: {
                            "0": ioRcv_n_0_32_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        
exports.commons_getArray = commons_getArray
exports.commons_setArray = commons_setArray
    