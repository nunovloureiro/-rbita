
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
function n_tgl_receiveMessage(state, m) {
                    if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                        state.valueFloat = msg_readFloatToken(m, 0)
                        const outMessage = msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            msgBusPublish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (msg_isBang(m)) {
                        state.valueFloat = state.valueFloat === 0 ? state.maxValue: 0
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
function msg_isAction(message, action) {
            return msg_isMatching(message, [MSG_STRING_TOKEN])
                && msg_readStringToken(message, 0) === action
        }

function n_metro_setRate(state, rate) {
        state.rate = Math.max(rate, 0)
    }
function n_metro_scheduleNextTick(state) {
        state.snd0(msg_bang())
        state.realNextTick = state.realNextTick + state.rate * state.sampleRatio
        state.skedId = commons_waitFrame(
            toInt(Math.round(state.realNextTick)), 
            state.tickCallback,
        )
    }
function n_metro_stop(state) {
        if (state.skedId !== SKED_ID_NULL) {
            commons_cancelWaitFrame(state.skedId)
            state.skedId = SKED_ID_NULL
        }
        state.realNextTick = 0
    }


function n_add_setLeft(state, value) {
                    state.leftOp = value
                }
function n_add_setRight(state, value) {
                    state.rightOp = value
                }
function n_modlegacy_setLeft(state, value) {
                    state.leftOp = value
                }
function n_modlegacy_setRight(state, value) {
                    state.rightOp = value
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


function mtof(value) {
        return value <= -1500 ? 0: (value > 1499 ? 3.282417553401589e+38 : Math.pow(2, (value - 69) / 12) * 440)
    }

function n_osc_t_setPhase(state, phase) {
            state.phase = phase % 1.0 * 2 * Math.PI
        }
        


function n_0_1_RCVS_0(m) {
                                
                n_tgl_receiveMessage(n_0_1_STATE, m)
                return
            
                                throw new Error('[tgl], id "n_0_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_2_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_0_2_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_0_2_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_0_2_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_3_STATE.outTemplates[0])
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
                n_0_3_STATE.outMessages[0] = message
                n_0_3_STATE.messageTransferFunctions.splice(0, n_0_3_STATE.messageTransferFunctions.length - 1)
                n_0_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_3_STATE.messageTransferFunctions.length; i++) {
                    n_0_7_RCVS_0(n_0_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_7_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_0_7_STATE, msg_readFloatToken(m, 0))
                    n_0_4_RCVS_0(msg_floats([n_0_7_STATE.leftOp + n_0_7_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_4_RCVS_0(msg_floats([n_0_7_STATE.leftOp + n_0_7_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_0_7", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_7_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_0_7_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_0_7", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_4_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_modlegacy_setLeft(n_0_4_STATE, msg_readFloatToken(m, 0))
                    n_0_5_RCVS_0(msg_floats([n_0_4_STATE.leftOp % n_0_4_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_5_RCVS_0(msg_floats([n_0_4_STATE.leftOp % n_0_4_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[%], id "n_0_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_5_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_5_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_6_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_0_8_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_0_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_0_10_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_0_15_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_0_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_8_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_8_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_8_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_8_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_8_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_8_STATE.outTemplates[0])
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
                n_0_8_STATE.outMessages[0] = message
                n_0_8_STATE.messageTransferFunctions.splice(0, n_0_8_STATE.messageTransferFunctions.length - 1)
                n_0_8_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_8_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_8_STATE.messageTransferFunctions.length; i++) {
                    m_n_0_13_0__routemsg_RCVS_0(n_0_8_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_13_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_0_13_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_13_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_13_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_0_13_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_0_13_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_9_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_9_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_9_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_9_STATE.outTemplates[0])
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
                n_0_9_STATE.outMessages[0] = message
                n_0_9_STATE.messageTransferFunctions.splice(0, n_0_9_STATE.messageTransferFunctions.length - 1)
                n_0_9_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_9_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_9_STATE.messageTransferFunctions.length; i++) {
                    m_n_0_13_0__routemsg_RCVS_0(n_0_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_10_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_10_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_10_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_10_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_10_STATE.outTemplates[0])
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
                n_0_10_STATE.outMessages[0] = message
                n_0_10_STATE.messageTransferFunctions.splice(0, n_0_10_STATE.messageTransferFunctions.length - 1)
                n_0_10_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_10_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_10_STATE.messageTransferFunctions.length; i++) {
                    m_n_0_13_0__routemsg_RCVS_0(n_0_10_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_15_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_15_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_15_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_15_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_15_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_15_STATE.outTemplates[0])
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
                n_0_15_STATE.outMessages[0] = message
                n_0_15_STATE.messageTransferFunctions.splice(0, n_0_15_STATE.messageTransferFunctions.length - 1)
                n_0_15_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_15_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_15_STATE.messageTransferFunctions.length; i++) {
                    m_n_0_13_0__routemsg_RCVS_0(n_0_15_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_15", inlet "0", unsupported message : ' + msg_display(m))
                            }


let n_0_11_OUTS_0 = 0



let n_0_14_OUTS_0 = 0









function n_0_5_SNDS_0(m) {
                    n_0_6_RCVS_0(m)
n_0_7_RCVS_1(m)
                }













        

        function ioRcv_n_0_1_0(m) {n_0_1_RCVS_0(m)}
function ioRcv_n_0_3_0(m) {n_0_3_RCVS_0(m)}
function ioRcv_n_0_5_0(m) {n_0_5_RCVS_0(m)}
function ioRcv_n_0_8_0(m) {n_0_8_RCVS_0(m)}
function ioRcv_n_0_9_0(m) {n_0_9_RCVS_0(m)}
function ioRcv_n_0_10_0(m) {n_0_10_RCVS_0(m)}
function ioRcv_n_0_15_0(m) {n_0_15_RCVS_0(m)}
        

        commons_waitFrame(0, () => n_0_1_RCVS_0(msg_bang()))

                const n_0_1_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 0,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_0_1_STATE.messageReceiver = function (m) {
                        n_tgl_receiveMessage(n_0_1_STATE, m)
                    }
                    n_0_1_STATE.messageSender = n_0_2_RCVS_0
                    n_control_setReceiveBusName(n_0_1_STATE, "empty")
                })
    
                
            

        const n_0_2_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: n_0_3_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_0_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_0_2_STATE, 250)
            n_0_2_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_0_2_STATE)
            }
        })
    

        const n_0_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_3_STATE.outTemplates[0] = []
            
                n_0_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_3_STATE.outMessages[0] = msg_create(n_0_3_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_3_STATE.outMessages[0], 0, 1)
            
        
        
        n_0_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_3_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_7_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_0_7_STATE, 0)
            n_add_setRight(n_0_7_STATE, 0)
        

        const n_0_4_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_modlegacy_setLeft(n_0_4_STATE, 0)
            n_modlegacy_setRight(n_0_4_STATE, 4)
        

            const n_0_5_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_5_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_5_STATE, m)
                }
                n_0_5_STATE.messageSender = n_0_5_SNDS_0
                n_control_setReceiveBusName(n_0_5_STATE, "empty")
            })
        

        const n_0_6_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_8_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_8_STATE.outTemplates[0] = []
            
                n_0_8_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_8_STATE.outMessages[0] = msg_create(n_0_8_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_8_STATE.outMessages[0], 0, 63)
            
        
        
        n_0_8_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_8_STATE.outMessages[0]
                }
,
        ]
    


            const m_n_0_13_0_sig_STATE = {
                currentValue: 0
            }
        

        const n_0_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_9_STATE.outTemplates[0] = []
            
                n_0_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_9_STATE.outMessages[0] = msg_create(n_0_9_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_9_STATE.outMessages[0], 0, 65)
            
        
        
        n_0_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_10_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_10_STATE.outTemplates[0] = []
            
                n_0_10_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_10_STATE.outMessages[0] = msg_create(n_0_10_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_10_STATE.outMessages[0], 0, 57)
            
        
        
        n_0_10_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_10_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_15_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_15_STATE.outTemplates[0] = []
            
                n_0_15_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_15_STATE.outMessages[0] = msg_create(n_0_15_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_15_STATE.outMessages[0], 0, 65)
            
        
        
        n_0_15_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_15_STATE.outMessages[0]
                }
,
        ]
    


            const n_0_11_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_11_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_0_14_1_sig_STATE = {
                currentValue: 0.5
            }
        



        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_1":{"portletIds":["0"],"metadata":{"group":"control:float","type":"tgl","label":"","position":[694,389],"initValue":0,"minValue":0,"maxValue":1}},"n_0_3":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[694,448]}},"n_0_5":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"empty","position":[694,536]}},"n_0_8":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[694,598]}},"n_0_9":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[734,598]}},"n_0_10":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[774,598]}},"n_0_15":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[813,598]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_1":{"0":"ioRcv_n_0_1_0"},"n_0_3":{"0":"ioRcv_n_0_3_0"},"n_0_5":{"0":"ioRcv_n_0_5_0"},"n_0_8":{"0":"ioRcv_n_0_8_0"},"n_0_9":{"0":"ioRcv_n_0_9_0"},"n_0_10":{"0":"ioRcv_n_0_10_0"},"n_0_15":{"0":"ioRcv_n_0_15_0"}},"messageSenders":{}}}}},
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
            
        n_0_11_OUTS_0 = Math.cos(n_0_11_STATE.phase)
        n_0_11_STATE.phase += (n_0_11_STATE.J * mtof(m_n_0_13_0_sig_STATE.currentValue))
    
n_0_14_OUTS_0 = n_0_11_OUTS_0 * m_n_0_14_1_sig_STATE.currentValue
OUTPUT[0][F] = n_0_14_OUTS_0
OUTPUT[1][F] = n_0_14_OUTS_0
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_1: {
                            "0": ioRcv_n_0_1_0,
                        },
n_0_3: {
                            "0": ioRcv_n_0_3_0,
                        },
n_0_5: {
                            "0": ioRcv_n_0_5_0,
                        },
n_0_8: {
                            "0": ioRcv_n_0_8_0,
                        },
n_0_9: {
                            "0": ioRcv_n_0_9_0,
                        },
n_0_10: {
                            "0": ioRcv_n_0_10_0,
                        },
n_0_15: {
                            "0": ioRcv_n_0_15_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        

    