
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
function n_sl_receiveMessage(state, m) {
                    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                        state.valueFloat = msg_readFloatToken(m, 0)
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (msg_isBang(m)) {
                        
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN]) 
                        && msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = msg_readFloatToken(m, 1)
                        return
                    
                    } else if (n_control_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }

function n_float_int_setValueInt(state, value) {
        state.value = roundFloatAsPdInt(value)
    }
function n_float_int_setValueFloat(state, value) {
        state.value = value
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



function n_list_setSplitPoint(state, value) {
        state.splitPoint = toInt(value)
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
function msg_isAction(message, action) {
            return msg_isMatching(message, [MSG_STRING_TOKEN])
                && msg_readStringToken(message, 0) === action
        }
const n_tabbase_emptyArray = createFloatArray(1)

function n_tabbase_createState(arrayName) {
        return {
            array: n_tabbase_emptyArray,
            arrayName,
            arrayChangesSubscription: SKED_ID_NULL,
            readPosition: 0,
            readUntil: 0,
            writePosition: 0,
        }
    }
function n_tabbase_setArrayName(state, arrayName, callback) {
        if (state.arrayChangesSubscription != SKED_ID_NULL) {
            commons_cancelArrayChangesSubscription(state.arrayChangesSubscription)
        }
        state.arrayName = arrayName
        state.array = n_tabbase_emptyArray
        commons_subscribeArrayChanges(arrayName, callback)
    }
function n_tabbase_prepareIndex(index, arrayLength) {
        return toInt(Math.min(
            Math.max(
                0, Math.floor(index)
            ), toFloat(arrayLength - 1)
        ))
    }
function n_tabread_t_setArrayNameFinalize(state) {
                state.array = commons_getArray(state.arrayName)
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
        


function m_n_0_0_1__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_0_0_1_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_0_1__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }
let m_n_0_0_1_sig_OUTS_0 = 0
function m_n_0_0_1_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_0_0_1_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_0_0_1_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_30_RCVS_0(m) {
                                
                n_sl_receiveMessage(n_0_30_STATE, m)
                return
            
                                throw new Error('[hsl], id "n_0_30", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_41_1__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_0_41_1_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_41_1__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }
let m_n_0_41_1_sig_OUTS_0 = 0
function m_n_0_41_1_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_0_41_1_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_0_41_1_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }



function m_n_0_23_1__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_0_23_1_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_23_1__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }
let m_n_0_23_1_sig_OUTS_0 = 0
function m_n_0_23_1_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_0_23_1_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_0_23_1_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_45_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueFloat(n_0_45_STATE, msg_readFloatToken(m, 0))
                n_1_0_RCVS_0(msg_floats([n_0_45_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_1_0_RCVS_0(msg_floats([n_0_45_STATE.value]))
                return
                
            }
        
                                throw new Error('[float], id "n_0_45", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_0_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_1_10_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_1_1_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_1_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_1_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 4
                        ) {
                            n_1_12_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 5
                        ) {
                            n_1_4_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 6
                        ) {
                            n_1_5_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 7
                        ) {
                            n_1_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 8
                        ) {
                            n_1_7_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 9
                        ) {
                            n_1_8_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 10
                        ) {
                            n_1_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 11
                        ) {
                            n_1_11_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_1_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_10_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_10_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_10_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_10_STATE.outTemplates[0])
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
                n_1_10_STATE.outMessages[0] = message
                n_1_10_STATE.messageTransferFunctions.splice(0, n_1_10_STATE.messageTransferFunctions.length - 1)
                n_1_10_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_10_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_10_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_10_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_37_RCVS_0(m) {
                                
                    if (msg_isBang(m)) {
                        n_0_36_RCVS_0(msg_getLength(n_0_37_STATE.currentList) === 0 ? msg_bang(): n_0_37_STATE.currentList)
                    } else {
                        n_0_36_RCVS_0(msg_getLength(n_0_37_STATE.currentList) === 0 && msg_getLength(m) === 0 ? msg_bang(): msg_concat(n_0_37_STATE.currentList, m))
                    }
                    return
                
                                throw new Error('[list], id "n_0_37", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_36_RCVS_0(m) {
                                
                if (n_0_36_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_36_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_36_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_36_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_36_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        m_n_0_48_0__routemsg_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_36_STATE.stringFilter
                    ) {
                        m_n_0_48_0__routemsg_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_36_STATE.floatFilter
                ) {
                    m_n_0_48_0__routemsg_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_48_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_0_48_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_48_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_0_48_OUTS_0 = 0
function n_0_48_RCVS_0_message(m) {
                                
            if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_tabbase_setArrayName(
                    n_0_48_STATE,
                    msg_readStringToken(m, 1),
                    () => n_tabread_t_setArrayNameFinalize(n_0_48_STATE),
                )
                return
    
            }
        
                                throw new Error('[tabread~], id "n_0_48", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_1_1_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_1_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_1_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_1_STATE.outTemplates[0])
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
                n_1_1_STATE.outMessages[0] = message
                n_1_1_STATE.messageTransferFunctions.splice(0, n_1_1_STATE.messageTransferFunctions.length - 1)
                n_1_1_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_1_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_1_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_1_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_2_STATE.outTemplates[0])
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
                n_1_2_STATE.outMessages[0] = message
                n_1_2_STATE.messageTransferFunctions.splice(0, n_1_2_STATE.messageTransferFunctions.length - 1)
                n_1_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_2_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_3_STATE.outTemplates[0])
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
                n_1_3_STATE.outMessages[0] = message
                n_1_3_STATE.messageTransferFunctions.splice(0, n_1_3_STATE.messageTransferFunctions.length - 1)
                n_1_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_3_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_12_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_12_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_12_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_12_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_12_STATE.outTemplates[0])
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
                n_1_12_STATE.outMessages[0] = message
                n_1_12_STATE.messageTransferFunctions.splice(0, n_1_12_STATE.messageTransferFunctions.length - 1)
                n_1_12_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_12_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_12_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_12_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_12", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_37_RCVS_0(n_1_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_5_STATE.outTemplates[0])
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
                n_1_5_STATE.outMessages[0] = message
                n_1_5_STATE.messageTransferFunctions.splice(0, n_1_5_STATE.messageTransferFunctions.length - 1)
                n_1_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_5_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_5", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_37_RCVS_0(n_1_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_7_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_7_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_7_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_7_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_7_STATE.outTemplates[0])
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
                n_1_7_STATE.outMessages[0] = message
                n_1_7_STATE.messageTransferFunctions.splice(0, n_1_7_STATE.messageTransferFunctions.length - 1)
                n_1_7_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_7_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_7_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_7_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_8_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_8_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_8_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_8_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_8_STATE.outTemplates[0])
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
                n_1_8_STATE.outMessages[0] = message
                n_1_8_STATE.messageTransferFunctions.splice(0, n_1_8_STATE.messageTransferFunctions.length - 1)
                n_1_8_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_8_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_8_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_8_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_9_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_9_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_9_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_9_STATE.outTemplates[0])
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
                n_1_9_STATE.outMessages[0] = message
                n_1_9_STATE.messageTransferFunctions.splice(0, n_1_9_STATE.messageTransferFunctions.length - 1)
                n_1_9_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_9_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_9_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_1_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_1_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_1_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_1_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_1_11_STATE.outTemplates[0])
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
                n_1_11_STATE.outMessages[0] = message
                n_1_11_STATE.messageTransferFunctions.splice(0, n_1_11_STATE.messageTransferFunctions.length - 1)
                n_1_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_1_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_1_11_STATE.messageTransferFunctions.length; i++) {
                    n_0_37_RCVS_0(n_1_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_11", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_0_53_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_53_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_53_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_53_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_53_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_53_STATE.outTemplates[0])
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
                n_0_53_STATE.outMessages[0] = message
                n_0_53_STATE.messageTransferFunctions.splice(0, n_0_53_STATE.messageTransferFunctions.length - 1)
                n_0_53_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_53_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_53_STATE.messageTransferFunctions.length; i++) {
                    n_0_54_RCVS_0(n_0_53_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_53", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_0_54_OUTS_0 = 0
function n_0_54_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_0_54_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "n_0_54", inlet "0", unsupported message : ' + msg_display(m))
                            }
































        

        function ioRcv_n_0_30_0(m) {n_0_30_RCVS_0(m)}
function ioRcv_n_0_53_0(m) {n_0_53_RCVS_0(m)}
        

        
            commons_waitEngineConfigure(() => {
                msgBusSubscribe("msRate", m_n_0_0_1__routemsg_RCVS_0)
            })
        


            const m_n_0_0_1_sig_STATE = {
                currentValue: 0
            }
        

                const n_0_30_STATE = {
                    minValue: 0,
                    maxValue: 3,
                    valueFloat: 0,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_0_30_STATE.messageReceiver = function (m) {
                        n_sl_receiveMessage(n_0_30_STATE, m)
                    }
                    n_0_30_STATE.messageSender = m_n_0_41_1__routemsg_RCVS_0
                    n_control_setReceiveBusName(n_0_30_STATE, "empty")
                })
    
                
            


            const m_n_0_41_1_sig_STATE = {
                currentValue: 0
            }
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("totalSampleLength", m_n_0_23_1__routemsg_RCVS_0)
            })
        


            const m_n_0_23_1_sig_STATE = {
                currentValue: 0
            }
        

            const n_0_45_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_0_45_STATE, 0)
        

        const n_1_0_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_1_10_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_10_STATE.outTemplates[0] = []
            
                n_1_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_10_STATE.outTemplates[0].push(2)
            
            n_1_10_STATE.outMessages[0] = msg_create(n_1_10_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_10_STATE.outMessages[0], 0, "n1")
            
        
        
        n_1_10_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_10_STATE.outMessages[0]
                }
,
        ]
    

    const n_0_37_STATE = {
        splitPoint: 0,
        currentList: msg_create([]),
    }

    

     
        {
            const template = [MSG_STRING_TOKEN,3]

            n_0_37_STATE.currentList = msg_create(template)

            msg_writeStringToken(n_0_37_STATE.currentList, 0, "set")
        }
    


        const n_0_36_STATE = {
            floatFilter: 0,
            stringFilter: "list",
            filterType: MSG_STRING_TOKEN,
        }
    


        const n_0_48_STATE = n_tabbase_createState("")

        commons_waitEngineConfigure(() => {
            if (n_0_48_STATE.arrayName.length) {
                n_tabbase_setArrayName(
                    n_0_48_STATE, 
                    n_0_48_STATE.arrayName,
                    () => n_tabread_t_setArrayNameFinalize(n_0_48_STATE)
                )
            }
        })
    

        const n_1_1_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_1_STATE.outTemplates[0] = []
            
                n_1_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_1_STATE.outTemplates[0].push(2)
            
            n_1_1_STATE.outMessages[0] = msg_create(n_1_1_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_1_STATE.outMessages[0], 0, "n2")
            
        
        
        n_1_1_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_1_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_2_STATE.outTemplates[0] = []
            
                n_1_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_2_STATE.outTemplates[0].push(2)
            
            n_1_2_STATE.outMessages[0] = msg_create(n_1_2_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_2_STATE.outMessages[0], 0, "n3")
            
        
        
        n_1_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_3_STATE.outTemplates[0] = []
            
                n_1_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_3_STATE.outTemplates[0].push(2)
            
            n_1_3_STATE.outMessages[0] = msg_create(n_1_3_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_3_STATE.outMessages[0], 0, "n4")
            
        
        
        n_1_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_3_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_12_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_12_STATE.outTemplates[0] = []
            
                n_1_12_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_12_STATE.outTemplates[0].push(2)
            
            n_1_12_STATE.outMessages[0] = msg_create(n_1_12_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_12_STATE.outMessages[0], 0, "n5")
            
        
        
        n_1_12_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_12_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_4_STATE.outTemplates[0] = []
            
                n_1_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_4_STATE.outTemplates[0].push(2)
            
            n_1_4_STATE.outMessages[0] = msg_create(n_1_4_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_4_STATE.outMessages[0], 0, "n6")
            
        
        
        n_1_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_5_STATE.outTemplates[0] = []
            
                n_1_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_5_STATE.outTemplates[0].push(2)
            
            n_1_5_STATE.outMessages[0] = msg_create(n_1_5_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_5_STATE.outMessages[0], 0, "n7")
            
        
        
        n_1_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_5_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_6_STATE.outTemplates[0] = []
            
                n_1_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_6_STATE.outTemplates[0].push(2)
            
            n_1_6_STATE.outMessages[0] = msg_create(n_1_6_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_6_STATE.outMessages[0], 0, "n8")
            
        
        
        n_1_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_7_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_7_STATE.outTemplates[0] = []
            
                n_1_7_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_7_STATE.outTemplates[0].push(2)
            
            n_1_7_STATE.outMessages[0] = msg_create(n_1_7_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_7_STATE.outMessages[0], 0, "n9")
            
        
        
        n_1_7_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_7_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_8_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_8_STATE.outTemplates[0] = []
            
                n_1_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_8_STATE.outTemplates[0].push(3)
            
            n_1_8_STATE.outMessages[0] = msg_create(n_1_8_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_8_STATE.outMessages[0], 0, "n10")
            
        
        
        n_1_8_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_8_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_9_STATE.outTemplates[0] = []
            
                n_1_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_9_STATE.outTemplates[0].push(3)
            
            n_1_9_STATE.outMessages[0] = msg_create(n_1_9_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_9_STATE.outMessages[0], 0, "n11")
            
        
        
        n_1_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_11_STATE.outTemplates[0] = []
            
                n_1_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_1_11_STATE.outTemplates[0].push(3)
            
            n_1_11_STATE.outMessages[0] = msg_create(n_1_11_STATE.outTemplates[0])
            
                msg_writeStringToken(n_1_11_STATE.outMessages[0], 0, "n12")
            
        
        
        n_1_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_47_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_47_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_0_47_STATE, 10)
        })
    
commons_waitFrame(0, () => n_0_53_RCVS_0(msg_bang()))

        const n_0_53_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_53_STATE.outTemplates[0] = []
            
                n_0_53_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_53_STATE.outMessages[0] = msg_create(n_0_53_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_53_STATE.outMessages[0], 0, 1000)
            
        
        
        n_0_53_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_53_STATE.outMessages[0]
                }
,
        ]
    

            const n_0_54_STATE = {
                currentValue: 0
            }
        

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_30":{"portletIds":["0"],"metadata":{"group":"control:float","type":"hsl","label":"","position":[617,450],"initValue":0,"minValue":0,"maxValue":3}},"n_0_53":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[837,283]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_30":{"0":"ioRcv_n_0_30_0"},"n_0_53":{"0":"ioRcv_n_0_53_0"}},"messageSenders":{}}}}},
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
                    n_0_30: {
                            "0": ioRcv_n_0_30_0,
                        },
n_0_53: {
                            "0": ioRcv_n_0_53_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        
exports.commons_getArray = commons_getArray
exports.commons_setArray = commons_setArray
    