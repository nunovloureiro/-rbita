
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

const FS_OPERATION_SUCCESS = 0
const FS_OPERATION_FAILURE = 1
const _FS_OPERATIONS_IDS = new Set()
const _FS_OPERATIONS_CALLBACKS = new Map()
const _FS_OPERATIONS_SOUND_CALLBACKS = new Map()
let _FS_OPERATION_COUNTER = 1

function fs_soundInfoToMessage(soundInfo) {
                const info = msg_create([
                    MSG_FLOAT_TOKEN,
                    MSG_FLOAT_TOKEN,
                    MSG_FLOAT_TOKEN,
                    MSG_STRING_TOKEN,
                    soundInfo.encodingFormat.length,
                    MSG_STRING_TOKEN,
                    soundInfo.endianness.length,
                    MSG_STRING_TOKEN,
                    soundInfo.extraOptions.length
                ])
                msg_writeFloatToken(info, 0, toFloat(soundInfo.channelCount))
                msg_writeFloatToken(info, 1, toFloat(soundInfo.sampleRate))
                msg_writeFloatToken(info, 2, toFloat(soundInfo.bitDepth))
                msg_writeStringToken(info, 3, soundInfo.encodingFormat)
                msg_writeStringToken(info, 4, soundInfo.endianness)
                msg_writeStringToken(info, 5, soundInfo.extraOptions)
                return info
            }
function _fs_assertOperationExists(id, operationName) {
                if (!_FS_OPERATIONS_IDS.has(id)) {
                    throw new Error(operationName + ' operation unknown : ' + id.toString())
                }
            }
function _fs_createOperationId() {
                const id = _FS_OPERATION_COUNTER++
                _FS_OPERATIONS_IDS.add(id)
                return id
            }
function parseSoundFileOpenOpts(m, soundInfo) {
            const unhandled = new Set()
            let i = 0
            while (i < msg_getLength(m)) {
                if (msg_isStringToken(m, i)) {
                    const str = msg_readStringToken(m, i)
                    if (['-wave', '-aiff', '-caf', '-next', '-ascii'].includes(str)) {
                        soundInfo.encodingFormat = str.slice(1)

                    } else if (str === '-raw') {
                        console.log('-raw format not yet supported')
                        i += 4
                        
                    } else if (str === '-big') {
                        soundInfo.endianness = 'b'

                    } else if (str === '-little') {
                        soundInfo.endianness = 'l'

                    } else if (str === '-bytes') {
                        if (i < msg_getLength(m) && msg_isFloatToken(m, i + 1)) {
                            soundInfo.bitDepth = toInt(msg_readFloatToken(m, i + 1) * 8)
                            i++
                        } else {
                            console.log('failed to parse -bytes <value>')
                        }

                    } else if (str === '-rate') {
                        if (i < msg_getLength(m) && msg_isFloatToken(m, i + 1)) {
                            soundInfo.sampleRate = toInt(msg_readFloatToken(m, i + 1))
                            i++
                        } else {
                            console.log('failed to parse -rate <value>')
                        }

                    } else {
                        unhandled.add(i)
                    }
                    
                } else {
                    unhandled.add(i)
                }
                i++
            }
            return unhandled
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
function fs_readSoundFile(url, soundInfo, callback) {
            const id = _fs_createOperationId()
            _FS_OPERATIONS_SOUND_CALLBACKS.set(id, callback)
            i_fs_readSoundFile(id, url, fs_soundInfoToMessage(soundInfo))
            return id
        }
function x_fs_onReadSoundFileResponse(id, status, sound) {
            _fs_assertOperationExists(id, 'x_fs_onReadSoundFileResponse')
            _FS_OPERATIONS_IDS.delete(id)
            // Finish cleaning before calling the callback in case it would throw an error.
            const callback = _FS_OPERATIONS_SOUND_CALLBACKS.get(id)
            callback(id, status, sound)
            _FS_OPERATIONS_SOUND_CALLBACKS.delete(id)
        }
function fs_writeSoundFile(sound, url, soundInfo, callback) {
            const id = _fs_createOperationId()
            _FS_OPERATIONS_CALLBACKS.set(id, callback)
            i_fs_writeSoundFile(id, sound, url, fs_soundInfoToMessage(soundInfo))
            return id
        }
function x_fs_onWriteSoundFileResponse(id, status) {
            _fs_assertOperationExists(id, 'x_fs_onWriteSoundFileResponse')
            _FS_OPERATIONS_IDS.delete(id)
            // Finish cleaning before calling the callback in case it would throw an error.
            const callback = _FS_OPERATIONS_CALLBACKS.get(id)
            callback(id, status)
            _FS_OPERATIONS_CALLBACKS.delete(id)
        }


function n_soundfiler_buildMessage1(soundInfo) {
        const m = msg_create([
            MSG_FLOAT_TOKEN,
            MSG_FLOAT_TOKEN,
            MSG_FLOAT_TOKEN,
            MSG_FLOAT_TOKEN,
            MSG_STRING_TOKEN,
            soundInfo.endianness.length,
        ])
        msg_writeFloatToken(m, 0, toFloat(soundInfo.sampleRate))
        msg_writeFloatToken(m, 1, -1) // TODO IMPLEMENT headersize
        msg_writeFloatToken(m, 2, toFloat(soundInfo.channelCount))
        msg_writeFloatToken(m, 3, Math.round(toFloat(soundInfo.bitDepth) / 8))
        msg_writeStringToken(m, 4, soundInfo.endianness)
        return m
    }

function n_div_setLeft(state, value) {
                    state.leftOp = value
                }
function n_div_setRight(state, value) {
                    state.rightOp = value
                }
function n_mul_setLeft(state, value) {
                    state.leftOp = value
                }
function n_mul_setRight(state, value) {
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
function roundFloatAsPdInt(value) {
        return value > 0 ? Math.floor(value): Math.ceil(value)
    }

function n_float_int_setValueInt(state, value) {
        state.value = roundFloatAsPdInt(value)
    }
function n_float_int_setValueFloat(state, value) {
        state.value = value
    }


function n_random_setMaxValue(state, maxValue) {
        state.maxValue = Math.max(maxValue, 0)
    }
function n_eq_setLeft(state, value) {
                    state.leftOp = value
                }
function n_eq_setRight(state, value) {
                    state.rightOp = value
                }
function n_sub_setLeft(state, value) {
                    state.leftOp = value
                }
function n_sub_setRight(state, value) {
                    state.rightOp = value
                }

        
function n_0_1_RCVS_0(m) {
                                
                n_tgl_receiveMessage(n_0_1_STATE, m)
                return
            
                                throw new Error('[tgl], id "n_0_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_5_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_0_5_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_0_5_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_0_5_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_3_RCVS_0(m) {
                                
            msgBusPublish(n_0_3_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_6_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_6_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_9_RCVS_0(m) {
                                
        n_0_7_RCVS_0(msg_bang())
n_0_9_SNDS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_0_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_83_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_83_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_83_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_83_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_83_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_83_STATE.outTemplates[0])
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
                n_0_83_STATE.outMessages[0] = message
                n_0_83_STATE.messageTransferFunctions.splice(0, n_0_83_STATE.messageTransferFunctions.length - 1)
                n_0_83_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_83_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_83_STATE.messageTransferFunctions.length; i++) {
                    n_0_8_RCVS_0(n_0_83_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_83", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_8_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_8_STATE.operations.get(id)
                        n_0_8_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_12_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_8_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_8_STATE.operations.get(id)
                    n_0_8_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_12_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_8_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_12_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_12_STATE, msg_readFloatToken(m, 0))
                    n_0_13_RCVS_0(msg_floats([n_0_12_STATE.rightOp !== 0 ? n_0_12_STATE.leftOp / n_0_12_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_13_RCVS_0(msg_floats([n_0_12_STATE.rightOp !== 0 ? n_0_12_STATE.leftOp / n_0_12_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_12", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_12_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_12_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_12", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_13_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_13_STATE, msg_readFloatToken(m, 0))
                    n_0_14_RCVS_0(msg_floats([n_0_13_STATE.leftOp * n_0_13_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_14_RCVS_0(msg_floats([n_0_13_STATE.leftOp * n_0_13_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_14_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_14_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_27_RCVS_0(m) {
                                
            msgBusPublish(n_0_27_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_27", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_97_RCVS_0(m) {
                                
        n_0_99_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_97", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_99_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_99_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_99_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_99_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_99_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_99_STATE.outTemplates[0])
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
                n_0_99_STATE.outMessages[0] = message
                n_0_99_STATE.messageTransferFunctions.splice(0, n_0_99_STATE.messageTransferFunctions.length - 1)
                n_0_99_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_99_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_99_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_99_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_99", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_84_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_84_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_84_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_84_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_84_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_84_STATE.outTemplates[0])
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
                n_0_84_STATE.outMessages[0] = message
                n_0_84_STATE.messageTransferFunctions.splice(0, n_0_84_STATE.messageTransferFunctions.length - 1)
                n_0_84_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_84_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_84_STATE.messageTransferFunctions.length; i++) {
                    n_0_28_RCVS_0(n_0_84_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_84", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_28_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_28_STATE.operations.get(id)
                        n_0_28_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_29_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_28_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_28_STATE.operations.get(id)
                    n_0_28_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_29_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_28_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_28", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_29_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_29_STATE, msg_readFloatToken(m, 0))
                    n_0_30_RCVS_0(msg_floats([n_0_29_STATE.rightOp !== 0 ? n_0_29_STATE.leftOp / n_0_29_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_30_RCVS_0(msg_floats([n_0_29_STATE.rightOp !== 0 ? n_0_29_STATE.leftOp / n_0_29_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_29_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_29_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_29", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_30_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_30_STATE, msg_readFloatToken(m, 0))
                    n_0_31_RCVS_0(msg_floats([n_0_30_STATE.leftOp * n_0_30_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_31_RCVS_0(msg_floats([n_0_30_STATE.leftOp * n_0_30_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_30", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_31_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_31_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_31", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_82_RCVS_0(m) {
                                
            msgBusPublish(n_0_82_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_82", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_100_RCVS_0(m) {
                                
        n_0_102_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_100", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_102_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_102_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_102_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_102_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_102_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_102_STATE.outTemplates[0])
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
                n_0_102_STATE.outMessages[0] = message
                n_0_102_STATE.messageTransferFunctions.splice(0, n_0_102_STATE.messageTransferFunctions.length - 1)
                n_0_102_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_102_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_102_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_102_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_102", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_85_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_85_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_85_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_85_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_85_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_85_STATE.outTemplates[0])
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
                n_0_85_STATE.outMessages[0] = message
                n_0_85_STATE.messageTransferFunctions.splice(0, n_0_85_STATE.messageTransferFunctions.length - 1)
                n_0_85_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_85_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_85_STATE.messageTransferFunctions.length; i++) {
                    n_0_32_RCVS_0(n_0_85_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_85", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_32_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_32_STATE.operations.get(id)
                        n_0_32_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_33_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_32_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_32_STATE.operations.get(id)
                    n_0_32_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_33_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_32_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_32", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_33_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_33_STATE, msg_readFloatToken(m, 0))
                    n_0_34_RCVS_0(msg_floats([n_0_33_STATE.rightOp !== 0 ? n_0_33_STATE.leftOp / n_0_33_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_34_RCVS_0(msg_floats([n_0_33_STATE.rightOp !== 0 ? n_0_33_STATE.leftOp / n_0_33_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_33", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_33_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_33_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_33", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_34_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_34_STATE, msg_readFloatToken(m, 0))
                    n_0_35_RCVS_0(msg_floats([n_0_34_STATE.leftOp * n_0_34_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_35_RCVS_0(msg_floats([n_0_34_STATE.leftOp * n_0_34_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_35_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_35_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_81_RCVS_0(m) {
                                
            msgBusPublish(n_0_81_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_81", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_103_RCVS_0(m) {
                                
        n_0_107_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_103", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_107_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_107_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_107_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_107_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_107_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_107_STATE.outTemplates[0])
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
                n_0_107_STATE.outMessages[0] = message
                n_0_107_STATE.messageTransferFunctions.splice(0, n_0_107_STATE.messageTransferFunctions.length - 1)
                n_0_107_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_107_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_107_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_107_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_107", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_86_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_86_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_86_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_86_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_86_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_86_STATE.outTemplates[0])
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
                n_0_86_STATE.outMessages[0] = message
                n_0_86_STATE.messageTransferFunctions.splice(0, n_0_86_STATE.messageTransferFunctions.length - 1)
                n_0_86_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_86_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_86_STATE.messageTransferFunctions.length; i++) {
                    n_0_36_RCVS_0(n_0_86_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_86", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_36_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_36_STATE.operations.get(id)
                        n_0_36_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_37_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_36_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_36_STATE.operations.get(id)
                    n_0_36_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_37_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_36_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_37_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_37_STATE, msg_readFloatToken(m, 0))
                    n_0_38_RCVS_0(msg_floats([n_0_37_STATE.rightOp !== 0 ? n_0_37_STATE.leftOp / n_0_37_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_38_RCVS_0(msg_floats([n_0_37_STATE.rightOp !== 0 ? n_0_37_STATE.leftOp / n_0_37_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_37", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_37_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_37_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_37", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_38_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_38_STATE, msg_readFloatToken(m, 0))
                    n_0_39_RCVS_0(msg_floats([n_0_38_STATE.leftOp * n_0_38_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_39_RCVS_0(msg_floats([n_0_38_STATE.leftOp * n_0_38_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_39_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_39_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_39", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_80_RCVS_0(m) {
                                
            msgBusPublish(n_0_80_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_80", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_105_RCVS_0(m) {
                                
        n_0_108_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_105", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_108_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_108_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_108_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_108_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_108_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_108_STATE.outTemplates[0])
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
                n_0_108_STATE.outMessages[0] = message
                n_0_108_STATE.messageTransferFunctions.splice(0, n_0_108_STATE.messageTransferFunctions.length - 1)
                n_0_108_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_108_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_108_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_108_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_108", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_87_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_87_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_87_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_87_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_87_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_87_STATE.outTemplates[0])
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
                n_0_87_STATE.outMessages[0] = message
                n_0_87_STATE.messageTransferFunctions.splice(0, n_0_87_STATE.messageTransferFunctions.length - 1)
                n_0_87_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_87_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_87_STATE.messageTransferFunctions.length; i++) {
                    n_0_40_RCVS_0(n_0_87_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_87", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_40_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_40_STATE.operations.get(id)
                        n_0_40_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_41_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_40_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_40_STATE.operations.get(id)
                    n_0_40_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_41_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_40_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_40", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_41_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_41_STATE, msg_readFloatToken(m, 0))
                    n_0_42_RCVS_0(msg_floats([n_0_41_STATE.rightOp !== 0 ? n_0_41_STATE.leftOp / n_0_41_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_42_RCVS_0(msg_floats([n_0_41_STATE.rightOp !== 0 ? n_0_41_STATE.leftOp / n_0_41_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_41", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_41_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_41_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_41", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_42_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_42_STATE, msg_readFloatToken(m, 0))
                    n_0_43_RCVS_0(msg_floats([n_0_42_STATE.leftOp * n_0_42_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_43_RCVS_0(msg_floats([n_0_42_STATE.leftOp * n_0_42_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_42", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_43_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_43_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_43", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_79_RCVS_0(m) {
                                
            msgBusPublish(n_0_79_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_79", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_109_RCVS_0(m) {
                                
        n_0_117_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_109", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_117_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_117_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_117_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_117_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_117_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_117_STATE.outTemplates[0])
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
                n_0_117_STATE.outMessages[0] = message
                n_0_117_STATE.messageTransferFunctions.splice(0, n_0_117_STATE.messageTransferFunctions.length - 1)
                n_0_117_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_117_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_117_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_117_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_117", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_88_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_88_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_88_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_88_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_88_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_88_STATE.outTemplates[0])
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
                n_0_88_STATE.outMessages[0] = message
                n_0_88_STATE.messageTransferFunctions.splice(0, n_0_88_STATE.messageTransferFunctions.length - 1)
                n_0_88_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_88_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_88_STATE.messageTransferFunctions.length; i++) {
                    n_0_44_RCVS_0(n_0_88_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_88", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_44_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_44_STATE.operations.get(id)
                        n_0_44_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_45_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_44_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_44_STATE.operations.get(id)
                    n_0_44_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_45_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_44_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_44", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_45_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_45_STATE, msg_readFloatToken(m, 0))
                    n_0_46_RCVS_0(msg_floats([n_0_45_STATE.rightOp !== 0 ? n_0_45_STATE.leftOp / n_0_45_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_46_RCVS_0(msg_floats([n_0_45_STATE.rightOp !== 0 ? n_0_45_STATE.leftOp / n_0_45_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_45", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_45_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_45_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_45", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_46_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_46_STATE, msg_readFloatToken(m, 0))
                    n_0_47_RCVS_0(msg_floats([n_0_46_STATE.leftOp * n_0_46_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_47_RCVS_0(msg_floats([n_0_46_STATE.leftOp * n_0_46_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_46", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_47_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_47_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_47", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_78_RCVS_0(m) {
                                
            msgBusPublish(n_0_78_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_78", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_111_RCVS_0(m) {
                                
        n_0_118_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_111", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_118_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_118_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_118_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_118_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_118_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_118_STATE.outTemplates[0])
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
                n_0_118_STATE.outMessages[0] = message
                n_0_118_STATE.messageTransferFunctions.splice(0, n_0_118_STATE.messageTransferFunctions.length - 1)
                n_0_118_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_118_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_118_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_118_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_118", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_89_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_89_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_89_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_89_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_89_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_89_STATE.outTemplates[0])
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
                n_0_89_STATE.outMessages[0] = message
                n_0_89_STATE.messageTransferFunctions.splice(0, n_0_89_STATE.messageTransferFunctions.length - 1)
                n_0_89_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_89_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_89_STATE.messageTransferFunctions.length; i++) {
                    n_0_48_RCVS_0(n_0_89_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_89", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_48_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_48_STATE.operations.get(id)
                        n_0_48_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_49_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_48_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_48_STATE.operations.get(id)
                    n_0_48_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_49_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_48_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_48", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_49_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_49_STATE, msg_readFloatToken(m, 0))
                    n_0_50_RCVS_0(msg_floats([n_0_49_STATE.rightOp !== 0 ? n_0_49_STATE.leftOp / n_0_49_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_50_RCVS_0(msg_floats([n_0_49_STATE.rightOp !== 0 ? n_0_49_STATE.leftOp / n_0_49_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_49", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_49_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_49_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_49", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_50_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_50_STATE, msg_readFloatToken(m, 0))
                    n_0_51_RCVS_0(msg_floats([n_0_50_STATE.leftOp * n_0_50_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_51_RCVS_0(msg_floats([n_0_50_STATE.leftOp * n_0_50_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_50", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_51_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_51_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_51", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_77_RCVS_0(m) {
                                
            msgBusPublish(n_0_77_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_77", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_113_RCVS_0(m) {
                                
        n_0_119_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_113", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_119_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_119_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_119_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_119_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_119_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_119_STATE.outTemplates[0])
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
                n_0_119_STATE.outMessages[0] = message
                n_0_119_STATE.messageTransferFunctions.splice(0, n_0_119_STATE.messageTransferFunctions.length - 1)
                n_0_119_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_119_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_119_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_119_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_119", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_90_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_90_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_90_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_90_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_90_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_90_STATE.outTemplates[0])
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
                n_0_90_STATE.outMessages[0] = message
                n_0_90_STATE.messageTransferFunctions.splice(0, n_0_90_STATE.messageTransferFunctions.length - 1)
                n_0_90_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_90_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_90_STATE.messageTransferFunctions.length; i++) {
                    n_0_52_RCVS_0(n_0_90_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_90", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_52_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_52_STATE.operations.get(id)
                        n_0_52_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_53_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_52_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_52_STATE.operations.get(id)
                    n_0_52_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_53_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_52_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_52", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_53_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_53_STATE, msg_readFloatToken(m, 0))
                    n_0_54_RCVS_0(msg_floats([n_0_53_STATE.rightOp !== 0 ? n_0_53_STATE.leftOp / n_0_53_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_54_RCVS_0(msg_floats([n_0_53_STATE.rightOp !== 0 ? n_0_53_STATE.leftOp / n_0_53_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_53", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_53_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_53_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_53", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_54_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_54_STATE, msg_readFloatToken(m, 0))
                    n_0_55_RCVS_0(msg_floats([n_0_54_STATE.leftOp * n_0_54_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_55_RCVS_0(msg_floats([n_0_54_STATE.leftOp * n_0_54_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_54", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_55_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_55_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_55", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_76_RCVS_0(m) {
                                
            msgBusPublish(n_0_76_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_76", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_115_RCVS_0(m) {
                                
        n_0_120_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_115", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_120_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_120_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_120_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_120_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_120_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_120_STATE.outTemplates[0])
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
                n_0_120_STATE.outMessages[0] = message
                n_0_120_STATE.messageTransferFunctions.splice(0, n_0_120_STATE.messageTransferFunctions.length - 1)
                n_0_120_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_120_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_120_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_120_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_120", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_91_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_91_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_91_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_91_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_91_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_91_STATE.outTemplates[0])
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
                n_0_91_STATE.outMessages[0] = message
                n_0_91_STATE.messageTransferFunctions.splice(0, n_0_91_STATE.messageTransferFunctions.length - 1)
                n_0_91_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_91_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_91_STATE.messageTransferFunctions.length; i++) {
                    n_0_56_RCVS_0(n_0_91_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_91", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_56_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_56_STATE.operations.get(id)
                        n_0_56_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_57_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_56_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_56_STATE.operations.get(id)
                    n_0_56_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_57_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_56_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_56", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_57_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_57_STATE, msg_readFloatToken(m, 0))
                    n_0_58_RCVS_0(msg_floats([n_0_57_STATE.rightOp !== 0 ? n_0_57_STATE.leftOp / n_0_57_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_58_RCVS_0(msg_floats([n_0_57_STATE.rightOp !== 0 ? n_0_57_STATE.leftOp / n_0_57_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_57", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_57_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_57_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_57", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_58_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_58_STATE, msg_readFloatToken(m, 0))
                    n_0_59_RCVS_0(msg_floats([n_0_58_STATE.leftOp * n_0_58_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_59_RCVS_0(msg_floats([n_0_58_STATE.leftOp * n_0_58_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_58", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_59_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_59_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_59", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_75_RCVS_0(m) {
                                
            msgBusPublish(n_0_75_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_75", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_121_RCVS_0(m) {
                                
        n_0_129_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_121", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_129_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_129_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_129_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_129_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_129_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_129_STATE.outTemplates[0])
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
                n_0_129_STATE.outMessages[0] = message
                n_0_129_STATE.messageTransferFunctions.splice(0, n_0_129_STATE.messageTransferFunctions.length - 1)
                n_0_129_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_129_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_129_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_129_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_129", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_92_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_92_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_92_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_92_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_92_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_92_STATE.outTemplates[0])
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
                n_0_92_STATE.outMessages[0] = message
                n_0_92_STATE.messageTransferFunctions.splice(0, n_0_92_STATE.messageTransferFunctions.length - 1)
                n_0_92_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_92_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_92_STATE.messageTransferFunctions.length; i++) {
                    n_0_60_RCVS_0(n_0_92_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_92", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_60_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_60_STATE.operations.get(id)
                        n_0_60_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_61_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_60_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_60_STATE.operations.get(id)
                    n_0_60_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_61_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_60_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_60", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_61_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_61_STATE, msg_readFloatToken(m, 0))
                    n_0_62_RCVS_0(msg_floats([n_0_61_STATE.rightOp !== 0 ? n_0_61_STATE.leftOp / n_0_61_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_62_RCVS_0(msg_floats([n_0_61_STATE.rightOp !== 0 ? n_0_61_STATE.leftOp / n_0_61_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_61", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_61_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_61_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_61", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_62_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_62_STATE, msg_readFloatToken(m, 0))
                    n_0_63_RCVS_0(msg_floats([n_0_62_STATE.leftOp * n_0_62_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_63_RCVS_0(msg_floats([n_0_62_STATE.leftOp * n_0_62_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_62", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_63_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_63_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_63", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_74_RCVS_0(m) {
                                
            msgBusPublish(n_0_74_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_74", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_123_RCVS_0(m) {
                                
        n_0_130_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_123", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_130_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_130_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_130_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_130_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_130_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_130_STATE.outTemplates[0])
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
                n_0_130_STATE.outMessages[0] = message
                n_0_130_STATE.messageTransferFunctions.splice(0, n_0_130_STATE.messageTransferFunctions.length - 1)
                n_0_130_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_130_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_130_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_130_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_130", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_93_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_93_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_93_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_93_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_93_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_93_STATE.outTemplates[0])
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
                n_0_93_STATE.outMessages[0] = message
                n_0_93_STATE.messageTransferFunctions.splice(0, n_0_93_STATE.messageTransferFunctions.length - 1)
                n_0_93_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_93_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_93_STATE.messageTransferFunctions.length; i++) {
                    n_0_64_RCVS_0(n_0_93_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_93", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_64_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_64_STATE.operations.get(id)
                        n_0_64_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_65_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_64_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_64_STATE.operations.get(id)
                    n_0_64_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_65_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_64_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_64", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_65_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_65_STATE, msg_readFloatToken(m, 0))
                    n_0_66_RCVS_0(msg_floats([n_0_65_STATE.rightOp !== 0 ? n_0_65_STATE.leftOp / n_0_65_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_66_RCVS_0(msg_floats([n_0_65_STATE.rightOp !== 0 ? n_0_65_STATE.leftOp / n_0_65_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_65", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_65_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_65_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_65", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_66_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_66_STATE, msg_readFloatToken(m, 0))
                    n_0_67_RCVS_0(msg_floats([n_0_66_STATE.leftOp * n_0_66_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_67_RCVS_0(msg_floats([n_0_66_STATE.leftOp * n_0_66_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_66", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_67_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_67_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_67", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_73_RCVS_0(m) {
                                
            msgBusPublish(n_0_73_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_73", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_125_RCVS_0(m) {
                                
        n_0_131_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_125", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_131_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_131_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_131_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_131_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_131_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_131_STATE.outTemplates[0])
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
                n_0_131_STATE.outMessages[0] = message
                n_0_131_STATE.messageTransferFunctions.splice(0, n_0_131_STATE.messageTransferFunctions.length - 1)
                n_0_131_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_131_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_131_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_131_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_131", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_94_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_94_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_94_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_94_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_94_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_94_STATE.outTemplates[0])
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
                n_0_94_STATE.outMessages[0] = message
                n_0_94_STATE.messageTransferFunctions.splice(0, n_0_94_STATE.messageTransferFunctions.length - 1)
                n_0_94_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_94_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_94_STATE.messageTransferFunctions.length; i++) {
                    n_0_68_RCVS_0(n_0_94_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_94", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_68_RCVS_0(m) {
                                
        if (
            msg_getLength(m) >= 3 
            && msg_isStringToken(m, 0)
            && (
                msg_readStringToken(m, 0) === 'read'
                || msg_readStringToken(m, 0) === 'write'
            )
        ) {
            const operationType = msg_readStringToken(m, 0)
            const soundInfo = {
                channelCount: 0,
                sampleRate: toInt(SAMPLE_RATE),
                bitDepth: 32,
                encodingFormat: '',
                endianness: '',
                extraOptions: '',
            }
            const operation = {
                arrayNames: [],
                resize: false,
                maxSize: -1,
                skip: 0,
                framesToWrite: 0,
                url: '',
                soundInfo,
            }
            let unhandledOptions = parseSoundFileOpenOpts(
                m,
                soundInfo,
            )
            
            // Remove the operation type
            unhandledOptions.delete(0)
            
            let i = 1
            let str = ""
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (str === '-resize') {
                        unhandledOptions.delete(i)
                        operation.resize = true

                    } else if (str === '-maxsize' || str === '-nframes') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -maxsize")
                        }
                        operation.maxSize = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-skip') {
                        unhandledOptions.delete(i)
                        if (
                            i + 1 >= msg_getLength(m) 
                            || !msg_isFloatToken(m, i + 1)
                        ) {
                            console.log("invalid value for -skip")
                        }
                        operation.skip = msg_readFloatToken(m, i + 1)
                        unhandledOptions.delete(i + 1)
                        i++

                    } else if (str === '-normalize') {
                        unhandledOptions.delete(i)
                        console.log('-normalize not implemented')
                    }
                }
                i++
            }

            i = 1
            let urlFound = false
            while (i < msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (msg_isStringToken(m, i)) {
                    str = msg_readStringToken(m, i)
                    if (!str.startsWith('-') && urlFound === false) {
                        operation.url = str
                        urlFound = true
                    } else {
                        operation.arrayNames.push(str)
                    }
                    unhandledOptions.delete(i)
                }
                i++
            }

            for (i = 0; i < operation.arrayNames.length; i++) {
                if (!commons_hasArray(operation.arrayNames[i])) {
                    console.log('[soundfiler] unknown array ' + operation.arrayNames[i])
                    return
                }
            }

            if (unhandledOptions.size) {
                console.log("soundfiler received invalid options")
            }

            soundInfo.channelCount = operation.arrayNames.length

            if (operationType === 'read') {
                const id = fs_readSoundFile(
                    operation.url, 
                    soundInfo,
                    function (id, status, sound) {
                        const operation = n_0_68_STATE.operations.get(id)
                        n_0_68_STATE.operations.delete(id)
                        let i = 0
                        let maxFramesRead = 0
                        let framesToRead = 0
                        let array = createFloatArray(0)
                        for (i = 0; i < sound.length; i++) {
                            if (operation.resize) {
                                if (operation.maxSize > 0) {
                                    framesToRead = Math.min(
                                        operation.maxSize, 
                                        toFloat(sound[i].length) - operation.skip
                                    )
    
                                } else {
                                    framesToRead = toFloat(sound[i].length) - operation.skip
                                }
    
                                commons_setArray(
                                    operation.arrayNames[i], 
                                    sound[i].subarray(
                                        toInt(operation.skip), 
                                        toInt(operation.skip + framesToRead)
                                    )
                                )
                                
                            } else {
                                array = commons_getArray(operation.arrayNames[i])
                                framesToRead = Math.min(
                                    toFloat(array.length),
                                    toFloat(sound[i].length) - operation.skip
                                )
                                array.set(sound[i].subarray(0, array.length))
                            }
                            maxFramesRead = Math.max(
                                maxFramesRead,
                                framesToRead
                            )
                        }
    
                        SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                        n_0_69_RCVS_0(msg_floats([maxFramesRead]))
                    }
                )

                n_0_68_STATE.operations.set(id, operation)

            } else if (operationType === 'write') {
                let i = 0
                let framesToWrite = 0
                let array = createFloatArray(0)
                const sound = []
                
                for (i = 0; i < operation.arrayNames.length; i++) {
                    framesToWrite = Math.max(
                        framesToWrite,
                        toFloat(commons_getArray(operation.arrayNames[i]).length) - operation.skip,
                    )
                }

                if (operation.maxSize >= 0) {
                    framesToWrite = Math.min(
                        operation.maxSize, 
                        framesToWrite
                    )
                }
                operation.framesToWrite = framesToWrite

                if (framesToWrite < 1) {
                    console.log('[soundfiler] no frames to write')
                    return
                }

                for (i = 0; i < operation.arrayNames.length; i++) {
                    array = commons_getArray(operation.arrayNames[i])
                    if (framesToWrite > toFloat(array.length) - operation.skip) {
                        sound.push(createFloatArray(toInt(framesToWrite)))
                        sound[i].set(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    } else {
                        sound.push(array.subarray(
                            toInt(operation.skip), 
                            toInt(operation.skip + framesToWrite)
                        ))
                    }
                }

                function callback(id, status) {
                    const operation = n_0_68_STATE.operations.get(id)
                    n_0_68_STATE.operations.delete(id)
                    SND_TO_NULL(n_soundfiler_buildMessage1(operation.soundInfo))
                    n_0_69_RCVS_0(msg_floats([operation.framesToWrite]))
                }

                const id = fs_writeSoundFile(
                    sound, 
                    operation.url, 
                    soundInfo, 
                    callback
                )

                n_0_68_STATE.operations.set(id, operation)
            }

            return
        }
    
                                throw new Error('[soundfiler], id "n_0_68", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_69_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_69_STATE, msg_readFloatToken(m, 0))
                    n_0_70_RCVS_0(msg_floats([n_0_69_STATE.rightOp !== 0 ? n_0_69_STATE.leftOp / n_0_69_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_70_RCVS_0(msg_floats([n_0_69_STATE.rightOp !== 0 ? n_0_69_STATE.leftOp / n_0_69_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_69", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_69_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_0_69_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_0_69", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_70_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_0_70_STATE, msg_readFloatToken(m, 0))
                    n_0_71_RCVS_0(msg_floats([n_0_70_STATE.leftOp * n_0_70_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_71_RCVS_0(msg_floats([n_0_70_STATE.leftOp * n_0_70_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_0_70", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_71_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_71_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_71", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_72_RCVS_0(m) {
                                
            msgBusPublish(n_0_72_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_72", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_127_RCVS_0(m) {
                                
        n_0_132_RCVS_0(msg_bang())
SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_127", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_132_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_132_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_132_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_132_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_132_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_132_STATE.outTemplates[0])
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
                n_0_132_STATE.outMessages[0] = message
                n_0_132_STATE.messageTransferFunctions.splice(0, n_0_132_STATE.messageTransferFunctions.length - 1)
                n_0_132_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_132_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_132_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_0_132_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_132", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_7_RCVS_0(m) {
                                
        if (msg_isBang(m)) { 
            n_0_7_SNDS_0(msg_floats([SAMPLE_RATE])) 
            return
        }
    
                                throw new Error('[samplerate~], id "n_0_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_10_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_0_10_STATE, msg_readFloatToken(m, 0))
                    n_0_11_RCVS_0(msg_floats([n_0_10_STATE.rightOp !== 0 ? n_0_10_STATE.leftOp / n_0_10_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_11_RCVS_0(msg_floats([n_0_10_STATE.rightOp !== 0 ? n_0_10_STATE.leftOp / n_0_10_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_0_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_11_RCVS_0(m) {
                                
            msgBusPublish(n_0_11_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_11", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_0_138_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_0_138_STATE, 
                            () => n_0_140_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_0_138_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_0_138_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_0_138_STATE,
                        () => n_0_140_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_0_138_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_0_138", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_140_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_140_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_140_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_140_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_140_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_140_STATE.outTemplates[0])
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
                n_0_140_STATE.outMessages[0] = message
                n_0_140_STATE.messageTransferFunctions.splice(0, n_0_140_STATE.messageTransferFunctions.length - 1)
                n_0_140_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_140_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_140_STATE.messageTransferFunctions.length; i++) {
                    n_0_142_RCVS_0(n_0_140_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_140", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_142_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_0_142_STATE, msg_readFloatToken(m, 0))
                    n_0_141_RCVS_0(msg_floats([n_0_142_STATE.leftOp + n_0_142_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_141_RCVS_0(msg_floats([n_0_142_STATE.leftOp + n_0_142_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_0_142", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_142_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_0_142_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_0_142", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_141_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_141_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_141", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_143_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_modlegacy_setLeft(n_0_143_STATE, msg_readFloatToken(m, 0))
                    n_0_144_RCVS_0(msg_floats([n_0_143_STATE.leftOp % n_0_143_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_144_RCVS_0(msg_floats([n_0_143_STATE.leftOp % n_0_143_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[%], id "n_0_143", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_144_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_144_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_144", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_145_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_0_145_STATE, msg_readFloatToken(m, 0))
                n_0_147_RCVS_0(msg_floats([n_0_145_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_0_147_RCVS_0(msg_floats([n_0_145_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_0_145", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_147_RCVS_0(m) {
                                
        SND_TO_NULL(msg_floats([messageTokenToFloat(m, 0)]))
n_0_163_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_28_10_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_0_147", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_10_RCVS_0(m) {
                                
                if (n_28_10_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_28_10_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_28_10_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_28_10_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_28_10_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_28_11_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_28_10_STATE.stringFilter
                    ) {
                        n_28_11_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_28_10_STATE.floatFilter
                ) {
                    n_28_11_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                n_28_5_RCVS_0(m)
            return
            
                                throw new Error('[route], id "n_28_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_28_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_28_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_28_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_28_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_28_11_STATE.outTemplates[0])
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
                n_28_11_STATE.outMessages[0] = message
                n_28_11_STATE.messageTransferFunctions.splice(0, n_28_11_STATE.messageTransferFunctions.length - 1)
                n_28_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_28_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_28_11_STATE.messageTransferFunctions.length; i++) {
                    n_28_5_RCVS_0(n_28_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_28_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_5_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_164_RCVS_0(msg_floats([Math.floor(Math.random() * n_28_5_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_28_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_164_RCVS_0(m) {
                                
        n_0_161_RCVS_1(msg_floats([messageTokenToFloat(m, 0)]))
n_0_169_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_0_165_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_0_153_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_0_150_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_164", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_150_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_eq_setLeft(n_0_150_STATE, msg_readFloatToken(m, 0))
                    n_0_156_RCVS_0(msg_floats([n_0_150_STATE.leftOp == n_0_150_STATE.rightOp ? 1: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_156_RCVS_0(msg_floats([n_0_150_STATE.leftOp == n_0_150_STATE.rightOp ? 1: 0]))
                    return
                }
            
                                throw new Error('[==], id "n_0_150", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_150_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_eq_setRight(n_0_150_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[==], id "n_0_150", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_156_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_0_156_STATE, msg_readFloatToken(m, 0))
                    n_0_176_RCVS_0(msg_floats([n_0_156_STATE.leftOp + n_0_156_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_176_RCVS_0(msg_floats([n_0_156_STATE.leftOp + n_0_156_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_0_156", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_156_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_0_156_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_0_156", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_176_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_0_176_STATE, msg_readFloatToken(m, 0))
                    n_0_176_SNDS_0(msg_floats([n_0_176_STATE.leftOp + n_0_176_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_176_SNDS_0(msg_floats([n_0_176_STATE.leftOp + n_0_176_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_0_176", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_176_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_0_176_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_0_176", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_157_RCVS_0(m) {
                                
                if (n_0_157_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_157_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_157_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_157_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_157_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_158_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_157_STATE.stringFilter
                    ) {
                        n_0_158_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_157_STATE.floatFilter
                ) {
                    n_0_158_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                n_0_159_RCVS_0(m)
            return
            
                                throw new Error('[route], id "n_0_157", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_158_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_158_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_158", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_161_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueFloat(n_0_161_STATE, msg_readFloatToken(m, 0))
                n_0_162_RCVS_0(msg_floats([n_0_161_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_0_162_RCVS_0(msg_floats([n_0_161_STATE.value]))
                return
                
            }
        
                                throw new Error('[float], id "n_0_161", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_161_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_float_int_setValueFloat(n_0_161_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[float], id "n_0_161", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_162_RCVS_0(m) {
                                
            msgBusPublish(n_0_162_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_162", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_159_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_159_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_159", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_160_RCVS_0(m) {
                                
            msgBusPublish(n_0_160_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_160", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_178_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_178_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_178", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_153_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_eq_setLeft(n_0_153_STATE, msg_readFloatToken(m, 0))
                    n_0_156_RCVS_1(msg_floats([n_0_153_STATE.leftOp == n_0_153_STATE.rightOp ? 1: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_156_RCVS_1(msg_floats([n_0_153_STATE.leftOp == n_0_153_STATE.rightOp ? 1: 0]))
                    return
                }
            
                                throw new Error('[==], id "n_0_153", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_153_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_eq_setRight(n_0_153_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[==], id "n_0_153", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_165_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_eq_setLeft(n_0_165_STATE, msg_readFloatToken(m, 0))
                    n_0_173_RCVS_0(msg_floats([n_0_165_STATE.leftOp == n_0_165_STATE.rightOp ? 1: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_173_RCVS_0(msg_floats([n_0_165_STATE.leftOp == n_0_165_STATE.rightOp ? 1: 0]))
                    return
                }
            
                                throw new Error('[==], id "n_0_165", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_165_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_eq_setRight(n_0_165_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[==], id "n_0_165", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_173_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_0_173_STATE, msg_readFloatToken(m, 0))
                    n_0_173_SNDS_0(msg_floats([n_0_173_STATE.leftOp + n_0_173_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_173_SNDS_0(msg_floats([n_0_173_STATE.leftOp + n_0_173_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_0_173", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_173_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_0_173_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_0_173", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_177_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_0_177_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_0_177", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_169_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_eq_setLeft(n_0_169_STATE, msg_readFloatToken(m, 0))
                    n_0_173_RCVS_1(msg_floats([n_0_169_STATE.leftOp == n_0_169_STATE.rightOp ? 1: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_173_RCVS_1(msg_floats([n_0_169_STATE.leftOp == n_0_169_STATE.rightOp ? 1: 0]))
                    return
                }
            
                                throw new Error('[==], id "n_0_169", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_169_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_eq_setRight(n_0_169_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[==], id "n_0_169", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_0_163_RCVS_0(m) {
                                
        n_0_172_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_0_166_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_0_174_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_0_175_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_163", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_175_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_sub_setLeft(n_0_175_STATE, msg_readFloatToken(m, 0))
                    SND_TO_NULL(msg_floats([n_0_175_STATE.leftOp - n_0_175_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    SND_TO_NULL(msg_floats([n_0_175_STATE.leftOp - n_0_175_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[-], id "n_0_175", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_174_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_sub_setLeft(n_0_174_STATE, msg_readFloatToken(m, 0))
                    SND_TO_NULL(msg_floats([n_0_174_STATE.leftOp - n_0_174_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    SND_TO_NULL(msg_floats([n_0_174_STATE.leftOp - n_0_174_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[-], id "n_0_174", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_166_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_sub_setLeft(n_0_166_STATE, msg_readFloatToken(m, 0))
                    SND_TO_NULL(msg_floats([n_0_166_STATE.leftOp - n_0_166_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    SND_TO_NULL(msg_floats([n_0_166_STATE.leftOp - n_0_166_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[-], id "n_0_166", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_172_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_sub_setLeft(n_0_172_STATE, msg_readFloatToken(m, 0))
                    SND_TO_NULL(msg_floats([n_0_172_STATE.leftOp - n_0_172_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    SND_TO_NULL(msg_floats([n_0_172_STATE.leftOp - n_0_172_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[-], id "n_0_172", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_135_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_135_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_135", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_27_17_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_27_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_27_17_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_27_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_1_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_27_1_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_27_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_7_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_27_7_SNDS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_27_7_SNDS_1(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 4
                        ) {
                            n_27_7_SNDS_2(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                n_27_11_RCVS_0(m)
                return
            
                                throw new Error('[route], id "n_27_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_27_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_27_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_16_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_27_16_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_27_16_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_27_16_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_27_16_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_27_16_STATE.outTemplates[0])
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
                n_27_16_STATE.outMessages[0] = message
                n_27_16_STATE.messageTransferFunctions.splice(0, n_27_16_STATE.messageTransferFunctions.length - 1)
                n_27_16_STATE.messageTransferFunctions[0] = function (m) {
                    return n_27_16_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_27_16_STATE.messageTransferFunctions.length; i++) {
                    n_27_15_RCVS_1(n_27_16_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_27_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_15_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_27_15_STATE, msg_readFloatToken(m, 0))
                    n_27_12_RCVS_0(msg_floats([n_27_15_STATE.leftOp + n_27_15_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_27_12_RCVS_0(msg_floats([n_27_15_STATE.leftOp + n_27_15_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_27_15", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_27_15_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_27_15_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_27_15", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_27_12_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_27_12_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_27_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_18_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_modlegacy_setLeft(n_27_18_STATE, msg_readFloatToken(m, 0))
                    n_27_13_RCVS_0(msg_floats([n_27_18_STATE.leftOp % n_27_18_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_27_13_RCVS_0(msg_floats([n_27_18_STATE.leftOp % n_27_18_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[%], id "n_27_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_13_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_27_13_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_27_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_14_RCVS_0(m) {
                                
                if (n_27_14_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_27_14_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_27_14_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_27_14_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_27_14_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_27_2_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_27_14_STATE.stringFilter
                    ) {
                        n_27_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_27_14_STATE.floatFilter
                ) {
                    n_27_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_27_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_9_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_27_10_RCVS_0(msg_floats([Math.floor(Math.random() * n_27_9_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_27_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_10_RCVS_0(m) {
                                
                if (n_27_10_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_27_10_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_27_10_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_27_10_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_27_10_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_27_6_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_27_10_STATE.stringFilter
                    ) {
                        n_27_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_27_10_STATE.floatFilter
                ) {
                    n_27_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_27_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_27_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_27_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_27_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_27_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_27_6_STATE.outTemplates[0])
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
                n_27_6_STATE.outMessages[0] = message
                n_27_6_STATE.messageTransferFunctions.splice(0, n_27_6_STATE.messageTransferFunctions.length - 1)
                n_27_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_27_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_27_6_STATE.messageTransferFunctions.length; i++) {
                    n_27_3_RCVS_0(n_27_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_27_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_3_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_27_3_STATE.continueIter = true
            while (n_27_3_STATE.continueIter) {
                n_27_3_SNDS_0(msg_bang())
            }
            return

        } else if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_27_3_STATE.continueIter = true
            let maxIterCount = toInt(msg_readFloatToken(m, 0))
            let iterCount = 0
            while (n_27_3_STATE.continueIter && iterCount++ < maxIterCount) {
                n_27_3_SNDS_0(msg_bang())
            }
            return
        }
    
                                throw new Error('[until], id "n_27_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_8_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_27_8_STATE, 
                            () => n_27_2_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_27_8_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_27_8_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_27_8_STATE,
                        () => n_27_2_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_27_8_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_27_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_27_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_27_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_27_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_27_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_27_11_STATE.outTemplates[0])
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
                n_27_11_STATE.outMessages[0] = message
                n_27_11_STATE.messageTransferFunctions.splice(0, n_27_11_STATE.messageTransferFunctions.length - 1)
                n_27_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_27_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_27_11_STATE.messageTransferFunctions.length; i++) {
                    n_27_15_RCVS_0(n_27_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_27_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

















function n_28_1_RCVS_0(m) {
                                
        n_28_17_RCVS_0(msg_bang())
n_28_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_28_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_28_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_28_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_28_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_28_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_28_4_STATE.outTemplates[0])
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
                n_28_4_STATE.outMessages[0] = message
                n_28_4_STATE.messageTransferFunctions.splice(0, n_28_4_STATE.messageTransferFunctions.length - 1)
                n_28_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_28_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_28_4_STATE.messageTransferFunctions.length; i++) {
                    SND_TO_NULL(n_28_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_28_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_17_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_28_17_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_28_17_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_28_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_28_17_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_28_17_STATE.outTemplates[0])
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
                n_28_17_STATE.outMessages[0] = message
                n_28_17_STATE.messageTransferFunctions.splice(0, n_28_17_STATE.messageTransferFunctions.length - 1)
                n_28_17_STATE.messageTransferFunctions[0] = function (m) {
                    return n_28_17_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_28_17_STATE.messageTransferFunctions.length; i++) {
                    n_28_20_RCVS_0(n_28_17_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_28_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_20_RCVS_0(m) {
                                
            msgBusPublish(n_28_20_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_28_20", inlet "0", unsupported message : ' + msg_display(m))
                            }







function n_0_9_SNDS_0(m) {
                    n_0_83_RCVS_0(m)
n_0_84_RCVS_0(m)
n_0_85_RCVS_0(m)
n_0_86_RCVS_0(m)
n_0_87_RCVS_0(m)
n_0_88_RCVS_0(m)
n_0_89_RCVS_0(m)
n_0_90_RCVS_0(m)
n_0_91_RCVS_0(m)
n_0_92_RCVS_0(m)
n_0_93_RCVS_0(m)
n_0_94_RCVS_0(m)
                }




function n_0_14_SNDS_0(m) {
                    n_0_27_RCVS_0(m)
n_0_97_RCVS_0(m)
                }







function n_0_31_SNDS_0(m) {
                    n_0_82_RCVS_0(m)
n_0_100_RCVS_0(m)
                }







function n_0_35_SNDS_0(m) {
                    n_0_81_RCVS_0(m)
n_0_103_RCVS_0(m)
                }







function n_0_39_SNDS_0(m) {
                    n_0_80_RCVS_0(m)
n_0_105_RCVS_0(m)
                }







function n_0_43_SNDS_0(m) {
                    n_0_79_RCVS_0(m)
n_0_109_RCVS_0(m)
                }







function n_0_47_SNDS_0(m) {
                    n_0_78_RCVS_0(m)
n_0_111_RCVS_0(m)
                }







function n_0_51_SNDS_0(m) {
                    n_0_77_RCVS_0(m)
n_0_113_RCVS_0(m)
                }







function n_0_55_SNDS_0(m) {
                    n_0_76_RCVS_0(m)
n_0_115_RCVS_0(m)
                }







function n_0_59_SNDS_0(m) {
                    n_0_75_RCVS_0(m)
n_0_121_RCVS_0(m)
                }







function n_0_63_SNDS_0(m) {
                    n_0_74_RCVS_0(m)
n_0_123_RCVS_0(m)
                }







function n_0_67_SNDS_0(m) {
                    n_0_73_RCVS_0(m)
n_0_125_RCVS_0(m)
                }







function n_0_71_SNDS_0(m) {
                    n_0_72_RCVS_0(m)
n_0_127_RCVS_0(m)
                }



function n_0_7_SNDS_0(m) {
                    n_0_10_RCVS_0(m)
n_0_12_RCVS_1(m)
n_0_29_RCVS_1(m)
n_0_33_RCVS_1(m)
n_0_37_RCVS_1(m)
n_0_41_RCVS_1(m)
n_0_45_RCVS_1(m)
n_0_49_RCVS_1(m)
n_0_53_RCVS_1(m)
n_0_57_RCVS_1(m)
n_0_61_RCVS_1(m)
n_0_65_RCVS_1(m)
n_0_69_RCVS_1(m)
                }







function n_0_141_SNDS_0(m) {
                    n_0_142_RCVS_1(m)
n_0_143_RCVS_0(m)
                }










function n_0_176_SNDS_0(m) {
                    n_0_157_RCVS_0(m)
n_0_178_RCVS_0(m)
                }









function n_0_173_SNDS_0(m) {
                    n_0_176_RCVS_1(m)
n_0_177_RCVS_0(m)
                }











function n_27_7_SNDS_0(m) {
                    n_27_2_RCVS_0(m)
n_27_16_RCVS_0(m)
                }
function n_27_7_SNDS_1(m) {
                    n_27_2_RCVS_0(m)
n_27_16_RCVS_0(m)
                }
function n_27_7_SNDS_2(m) {
                    n_27_9_RCVS_0(m)
n_27_16_RCVS_0(m)
                }



function n_27_12_SNDS_0(m) {
                    n_27_15_RCVS_1(m)
n_27_18_RCVS_0(m)
                }






function n_27_3_SNDS_0(m) {
                    n_0_135_RCVS_0(m)
n_27_8_RCVS_0(m)
                }
















        commons_setArray("hanning", createFloatArray(256))
commons_getArray("hanning").set([0,0.00015059100405778736,0.0006022750167176127,0.0013547800481319427,0.0024076399859040976,0.003760220017284155,0.005411739926785231,0.007361169904470444,0.009607340209186077,0.012148899957537651,0.01498430036008358,0.018111899495124817,0.021529799327254295,0.025235900655388832,0.02922789938747883,0.03350349888205528,0.03806009888648987,0.04289500042796135,0.048005200922489166,0.05338770151138306,0.05903920158743858,0.06495629996061325,0.0711354985833168,0.07757300138473511,0.08426500111818314,0.09120730310678482,0.09839589893817902,0.1058259978890419,0.11349400132894516,0.12139499932527542,0.12952400743961334,0.1378760039806366,0.14644600450992584,0.15522900223731995,0.16422000527381897,0.1734129935503006,0.18280300498008728,0.1923840045928955,0.20215000212192535,0.2120950073003769,0.2222139984369278,0.23250000178813934,0.2429479956626892,0.2535499930381775,0.26430100202560425,0.275193989276886,0.28622201085090637,0.2973789870738983,0.30865800380706787,0.32005199790000916,0.33155500888824463,0.3431589901447296,0.3548569977283478,0.3666430115699768,0.3785090148448944,0.39044898748397827,0.4024539887905121,0.4145190119743347,0.4266340136528015,0.43879398703575134,0.4509910047054291,0.46321800351142883,0.4754660129547119,0.487729012966156,0.5,0.512270987033844,0.5245339870452881,0.5367820262908936,0.5490090250968933,0.5612050294876099,0.5733649730682373,0.5854809880256653,0.5975450277328491,0.6095510125160217,0.6214900016784668,0.6333569884300232,0.6451429724693298,0.656840980052948,0.6684449911117554,0.6799479722976685,0.6913419961929321,0.7026209831237793,0.713778018951416,0.724806010723114,0.7356989979743958,0.7464500069618225,0.7570520043373108,0.7674990296363831,0.7777860164642334,0.7879049777984619,0.7978500127792358,0.8076159954071045,0.8171970248222351,0.8265870213508606,0.8357800245285034,0.8447710275650024,0.8535540103912354,0.8621240258216858,0.8704760074615479,0.8786050081253052,0.8865060210227966,0.8941739797592163,0.9016050100326538,0.9087929725646973,0.9157360196113586,0.9224280118942261,0.9288650155067444,0.93504399061203,0.9409610033035278,0.9466130137443542,0.9519950151443481,0.9571059942245483,0.9619399905204773,0.966497004032135,0.9707729816436768,0.9747650027275085,0.9784709811210632,0.981889009475708,0.9850159883499146,0.9878519773483276,0.9903929829597473,0.9926390051841736,0.9945889711380005,0.9962400197982788,0.9975929856300354,0.998645007610321,0.9993979930877686,0.9998490214347839,1,0.9998490214347839,0.9993979930877686,0.998645007610321,0.9975919723510742,0.9962390065193176,0.9945880174636841,0.9926379919052124,0.9903920292854309,0.9878510236740112,0.9850149750709534,0.9818869829177856,0.9784690141677856,0.9747629761695862,0.9707710146903992,0.9664949774742126,0.9619389772415161,0.9571040272712708,0.9519929885864258,0.9466109871864319,0.9409589767456055,0.9350420236587524,0.928862988948822,0.9224249720573425,0.9157329797744751,0.9087910056114197,0.901602029800415,0.8941709995269775,0.8865029811859131,0.8786020278930664,0.8704730272293091,0.8621209859848022,0.8535509705543518,0.8447679877281189,0.8357769846916199,0.826583981513977,0.8171939849853516,0.8076130151748657,0.7978469729423523,0.787900984287262,0.7777820229530334,0.7674959897994995,0.7570480108261108,0.7464460134506226,0.7356950044631958,0.7248020172119141,0.7137740254402161,0.7026169896125793,0.6913380026817322,0.6799439787864685,0.6684409976005554,0.656836986541748,0.6451389789581299,0.6333529949188232,0.6214860081672668,0.6095470190048218,0.5975409746170044,0.5854769945144653,0.5733609795570374,0.5612009763717651,0.5490040183067322,0.5367779731750488,0.5245299935340881,0.5122659802436829,0.49999600648880005,0.48772498965263367,0.4754619896411896,0.4632129967212677,0.4509870111942291,0.4387899935245514,0.4266299903392792,0.4145149886608124,0.40244999527931213,0.3904449939727783,0.37850499153137207,0.36663898825645447,0.3548530042171478,0.34315499663352966,0.3315509855747223,0.3200480043888092,0.3086540102958679,0.29737499356269836,0.28621798753738403,0.27518999576568604,0.2642970085144043,0.2535470128059387,0.24294400215148926,0.23249700665473938,0.22221100330352783,0.21209199726581573,0.2021459937095642,0.19237999618053436,0.18279899656772614,0.17340999841690063,0.1642169952392578,0.15522600710391998,0.14644299447536469,0.13787299394607544,0.12952099740505219,0.12139199674129486,0.1134909987449646,0.10582300275564194,0.09839289635419846,0.09120439738035202,0.08426210284233093,0.07757019996643066,0.07113280147314072,0.06495369970798492,0.05903669819235802,0.05338529869914055,0.04800289869308472,0.04289279878139496,0.038058001548051834,0.03350149840116501,0.029225999489426613,0.025234000757336617,0.021528100594878197,0.018110400065779686,0.014982899650931358,0.012147599831223488,0.009606149978935719,0.0073600998148322105,0.0054108197800815105,0.0037594400346279144,0.00240700994618237,0.0013543099630624056,0.0006019470165483654,0.0001504420069977641])
commons_setArray("crown", createFloatArray(22050))
commons_getArray("crown").set([0,0.0007558580255135894,0.0015117200091481209,0.002267570002004504,0.0030234300065785646,0.003779290011152625,0.004535149782896042,0.005291009787470102,0.006046860013157129,0.00680272001773119,0.00755858002230525,0.00831444002687931,0.009070290252566338,0.00982614979147911,0.010582000017166138,0.01133789960294962,0.012093699537217617,0.012849600054323673,0.013605399988591671,0.014361299574375153,0.015117200091481209,0.015873000025749207,0.016628900542855263,0.01738470047712326,0.018140599131584167,0.018896400928497314,0.01965229958295822,0.020408200100064278,0.021164000034332275,0.02191990055143833,0.02267570048570633,0.023431599140167236,0.024187499657273293,0.02494329959154129,0.025699200108647346,0.026455000042915344,0.0272109005600214,0.027966700494289398,0.028722599148750305,0.02947849966585636,0.03023429960012436,0.030990200117230415,0.03174600005149841,0.03250189870595932,0.03325770050287247,0.034013599157333374,0.03476950153708458,0.03552529960870743,0.036281198263168335,0.03703700006008148,0.03779289871454239,0.038548801094293594,0.03930459916591644,0.04006050154566765,0.0408162996172905,0.041572198271751404,0.04232800006866455,0.04308389872312546,0.04383980110287666,0.04459559917449951,0.04535150155425072,0.046107299625873566,0.04686319828033447,0.04761900007724762,0.04837489873170853,0.04913080111145973,0.04988659918308258,0.050642501562833786,0.051398299634456635,0.05215419828891754,0.05291010066866875,0.053665898740291595,0.0544218011200428,0.05517759919166565,0.055933501571416855,0.0566892996430397,0.05744519829750061,0.058201100677251816,0.058956898748874664,0.05971280112862587,0.06046859920024872,0.061224501579999924,0.06198029965162277,0.06273619830608368,0.06349209696054459,0.06424789875745773,0.06500379741191864,0.06575959920883179,0.0665154978632927,0.0672713965177536,0.06802719831466675,0.06878309696912766,0.0695388987660408,0.07029479742050171,0.07105059921741486,0.07180649787187576,0.07256239652633667,0.07331819832324982,0.07407409697771072,0.07482989877462387,0.07558579742908478,0.07634170353412628,0.07709749788045883,0.07785339653491974,0.07860919833183289,0.07936509698629379,0.08012089878320694,0.08087679743766785,0.08163270354270935,0.0823884978890419,0.08314439654350281,0.08390019834041595,0.08465609699487686,0.08541189879179001,0.08616779744625092,0.08692370355129242,0.08767949789762497,0.08843539655208588,0.08919119834899902,0.08994709700345993,0.09070300310850143,0.09145879745483398,0.09221470355987549,0.09297049790620804,0.09372639656066895,0.09448219835758209,0.095238097012043,0.0959940031170845,0.09674979746341705,0.09750570356845856,0.09826149791479111,0.09901739656925201,0.09977319836616516,0.10052900016307831,0.10128500312566757,0.10204099863767624,0.1027970016002655,0.10355299711227417,0.10430800169706345,0.10506399720907211,0.10582000017166138,0.10657600313425064,0.10733199864625931,0.10808800160884857,0.10884399712085724,0.10959900170564651,0.11035499721765518,0.11111100018024445,0.11186700314283371,0.11262299865484238,0.11337900161743164,0.11413499712944031,0.11489000171422958,0.11564599722623825,0.11640200018882751,0.11715800315141678,0.11791399866342545,0.11867000162601471,0.11942599713802338,0.12018100172281265,0.12093699723482132,0.12169300019741058,0.12244900315999985,0.12320499867200851,0.12396100163459778,0.12471699714660645,0.12547199428081512,0.12622800469398499,0.12698400020599365,0.12773999571800232,0.12849600613117218,0.12925200164318085,0.13000799715518951,0.1307629942893982,0.13151900470256805,0.13227500021457672,0.1330309957265854,0.13378700613975525,0.13454300165176392,0.13529899716377258,0.13605399429798126,0.13681000471115112,0.1375660002231598,0.13832199573516846,0.13907800614833832,0.13983400166034698,0.14058999717235565,0.14134499430656433,0.1421010047197342,0.14285700023174286,0.14361299574375153,0.1443690061569214,0.14512500166893005,0.14588099718093872,0.1466359943151474,0.14739200472831726,0.14814800024032593,0.1489039957523346,0.14966000616550446,0.15041600167751312,0.1511719971895218,0.15192699432373047,0.15268300473690033,0.153439000248909,0.15419499576091766,0.15495100617408752,0.1557070016860962,0.15646299719810486,0.15721799433231354,0.1579740047454834,0.15873000025749207,0.15948599576950073,0.1602420061826706,0.16099800169467926,0.16175399720668793,0.1625089943408966,0.16326500475406647,0.16402100026607513,0.1647769957780838,0.16553300619125366,0.16628900170326233,0.167044997215271,0.16779999434947968,0.16855600476264954,0.1693120002746582,0.17006799578666687,0.17082400619983673,0.1715800017118454,0.17233599722385406,0.17309099435806274,0.1738470047712326,0.17460300028324127,0.17535899579524994,0.1761150062084198,0.17687100172042847,0.17762699723243713,0.1783819943666458,0.17913800477981567,0.17989400029182434,0.180649995803833,0.18140600621700287,0.18216200172901154,0.1829179972410202,0.18367299437522888,0.18442900478839874,0.1851850003004074,0.18594099581241608,0.18669700622558594,0.1874530017375946,0.18820899724960327,0.18896399438381195,0.1897200047969818,0.19047600030899048,0.19123199582099915,0.191988006234169,0.19274400174617767,0.19349999725818634,0.19425499439239502,0.19501100480556488,0.19576700031757355,0.19652299582958221,0.19727900624275208,0.19803500175476074,0.1987909972667694,0.1995459944009781,0.20030200481414795,0.20105800032615662,0.20181399583816528,0.20257000625133514,0.2033260017633438,0.20408199727535248,0.20483699440956116,0.20559300482273102,0.20634900033473969,0.20710499584674835,0.2078610062599182,0.20861700177192688,0.20937299728393555,0.2101289927959442,0.2108840048313141,0.21164000034332275,0.21239599585533142,0.21315200626850128,0.21390800178050995,0.21466399729251862,0.21541999280452728,0.21617500483989716,0.21693100035190582,0.2176869958639145,0.21844300627708435,0.21919900178909302,0.21995499730110168,0.22071099281311035,0.22146600484848022,0.2222220003604889,0.22297799587249756,0.22373400628566742,0.2244900017976761,0.22524599730968475,0.22600199282169342,0.2267570048570633,0.22751300036907196,0.22826899588108063,0.2290250062942505,0.22978100180625916,0.23053699731826782,0.2312929928302765,0.23204800486564636,0.23280400037765503,0.2335599958896637,0.23431600630283356,0.23507200181484222,0.2358279973268509,0.23658399283885956,0.23733900487422943,0.2380950003862381,0.23885099589824677,0.23960700631141663,0.2403630018234253,0.24111899733543396,0.24187499284744263,0.2426300048828125,0.24338600039482117,0.24414199590682983,0.2448980063199997,0.24565400183200836,0.24640999734401703,0.2471659928560257,0.24792100489139557,0.24867700040340424,0.2494329959154129,0.25018900632858276,0.25094500184059143,0.2517009973526001,0.25245699286460876,0.25321200489997864,0.2539680004119873,0.25472399592399597,0.25547999143600464,0.2562359869480133,0.25699201226234436,0.257748007774353,0.2585029900074005,0.2592589855194092,0.26001501083374023,0.2607710063457489,0.26152700185775757,0.26228299736976624,0.2630389928817749,0.2637940049171448,0.26455000042915344,0.2653059959411621,0.2660619914531708,0.26681798696517944,0.2675740122795105,0.26833000779151917,0.26908499002456665,0.2698409855365753,0.27059701085090637,0.27135300636291504,0.2721090018749237,0.2728649973869324,0.27362099289894104,0.2743760049343109,0.2751320004463196,0.27588799595832825,0.2766439914703369,0.2773999869823456,0.27815601229667664,0.2789120078086853,0.2796669900417328,0.28042298555374146,0.2811790108680725,0.2819350063800812,0.28269100189208984,0.2834469974040985,0.2842029929161072,0.28495800495147705,0.2857140004634857,0.2864699959754944,0.28722599148750305,0.2879819869995117,0.2887380123138428,0.28949400782585144,0.2902489900588989,0.2910049855709076,0.29176101088523865,0.2925170063972473,0.293273001909256,0.29402899742126465,0.2947849929332733,0.2955400049686432,0.29629600048065186,0.2970519959926605,0.2978079915046692,0.29856398701667786,0.2993200123310089,0.3000760078430176,0.30083099007606506,0.30158698558807373,0.3023430109024048,0.30309900641441345,0.3038550019264221,0.3046109974384308,0.30536699295043945,0.3061220049858093,0.306878000497818,0.30763399600982666,0.3083899915218353,0.309145987033844,0.30990201234817505,0.3106580078601837,0.3114129900932312,0.31216898560523987,0.3129250109195709,0.3136810064315796,0.31443700194358826,0.3151929974555969,0.3159489929676056,0.31670400500297546,0.31746000051498413,0.3182159960269928,0.31897199153900146,0.31972798705101013,0.3204840123653412,0.32124000787734985,0.32199499011039734,0.322750985622406,0.32350701093673706,0.3242630064487457,0.3250190019607544,0.32577499747276306,0.32653099298477173,0.3272860050201416,0.32804200053215027,0.32879799604415894,0.3295539915561676,0.33030998706817627,0.3310660123825073,0.331822007894516,0.3325769901275635,0.33333298563957214,0.3340890109539032,0.33484500646591187,0.33560100197792053,0.3363569974899292,0.33711299300193787,0.33786800503730774,0.3386240005493164,0.3393799960613251,0.34013599157333374,0.3408919870853424,0.34164801239967346,0.34240400791168213,0.3431589901447296,0.3439149856567383,0.34467101097106934,0.345427006483078,0.34618300199508667,0.34693899750709534,0.347694993019104,0.3484500050544739,0.34920600056648254,0.3499619960784912,0.3507179915904999,0.35147398710250854,0.3522300124168396,0.35298600792884827,0.35374099016189575,0.3544969856739044,0.3552530109882355,0.35600900650024414,0.3567650020122528,0.3575209975242615,0.35827699303627014,0.3590329885482788,0.3597880005836487,0.36054399609565735,0.361299991607666,0.3620559871196747,0.36281201243400574,0.3635680079460144,0.3643229901790619,0.36507898569107056,0.3658350110054016,0.3665910065174103,0.36734700202941895,0.3681029975414276,0.3688589930534363,0.36961498856544495,0.3703700006008148,0.3711259961128235,0.37188199162483215,0.3726379871368408,0.3733940124511719,0.37415000796318054,0.3749060034751892,0.3756609857082367,0.37641701102256775,0.3771730065345764,0.3779290020465851,0.37868499755859375,0.3794409930706024,0.3801969885826111,0.38095200061798096,0.3817079961299896,0.3824639916419983,0.38321998715400696,0.383976012468338,0.3847320079803467,0.38548800349235535,0.38624298572540283,0.3869990110397339,0.38775500655174255,0.3885110020637512,0.3892669975757599,0.39002299308776855,0.3907789885997772,0.3915340006351471,0.39228999614715576,0.39304599165916443,0.3938019871711731,0.39455801248550415,0.3953140079975128,0.3960700035095215,0.39682498574256897,0.3975810110569,0.3983370065689087,0.39909300208091736,0.399848997592926,0.4006049931049347,0.40136098861694336,0.40211600065231323,0.4028719961643219,0.40362799167633057,0.40438398718833923,0.4051400125026703,0.40589600801467896,0.4066520035266876,0.4074069857597351,0.40816301107406616,0.40891900658607483,0.4096750020980835,0.41043099761009216,0.41118699312210083,0.4119429886341095,0.41269800066947937,0.41345399618148804,0.4142099916934967,0.41496598720550537,0.4157220125198364,0.4164780080318451,0.41723400354385376,0.41798898577690125,0.4187450110912323,0.41950100660324097,0.42025700211524963,0.4210129976272583,0.42176899313926697,0.42252498865127563,0.4232800006866455,0.4240359961986542,0.42479199171066284,0.4255479872226715,0.42630401253700256,0.42706000804901123,0.4278160035610199,0.4285709857940674,0.42932701110839844,0.4300830066204071,0.43083900213241577,0.43159499764442444,0.4323509931564331,0.4331069886684418,0.43386200070381165,0.4346179962158203,0.435373991727829,0.43612998723983765,0.4368860125541687,0.43764200806617737,0.43839800357818604,0.4391529858112335,0.4399090111255646,0.44066500663757324,0.4414210021495819,0.4421769976615906,0.44293299317359924,0.4436889886856079,0.4444440007209778,0.44519999623298645,0.4459559917449951,0.4467119872570038,0.44746801257133484,0.4482240080833435,0.4489800035953522,0.44973498582839966,0.4504910111427307,0.4512470066547394,0.45200300216674805,0.4527589976787567,0.4535149931907654,0.45427098870277405,0.4550260007381439,0.4557819962501526,0.45653799176216125,0.4572939872741699,0.458050012588501,0.45880600810050964,0.4595620036125183,0.4603169858455658,0.46107301115989685,0.4618290066719055,0.4625850021839142,0.46334099769592285,0.4640969932079315,0.4648529887199402,0.46560800075531006,0.4663639962673187,0.4671199917793274,0.46787598729133606,0.4686320126056671,0.4693880081176758,0.47014400362968445,0.47089898586273193,0.471655011177063,0.47241100668907166,0.4731670022010803,0.473922997713089,0.47467899322509766,0.4754349887371063,0.4761900007724762,0.47694599628448486,0.47770199179649353,0.4784579873085022,0.47921401262283325,0.4799700081348419,0.4807260036468506,0.48148098587989807,0.4822370111942291,0.4829930067062378,0.48374900221824646,0.4845049977302551,0.4852609932422638,0.48601698875427246,0.48677200078964233,0.487527996301651,0.48828399181365967,0.48903998732566833,0.4897960126399994,0.49055200815200806,0.4913080036640167,0.4920629858970642,0.49281901121139526,0.49357500672340393,0.4943310022354126,0.49508699774742126,0.49584299325942993,0.4965989887714386,0.49735501408576965,0.49810999631881714,0.4988659918308258,0.4996219873428345,0.5003780126571655,0.5011339783668518,0.5018900036811829,0.5026450157165527,0.503400981426239,0.5041570067405701,0.5049129724502563,0.5056689977645874,0.5064250230789185,0.5071809887886047,0.5079370141029358,0.5086920261383057,0.5094479918479919,0.510204017162323,0.5109599828720093,0.5117160081863403,0.5124719738960266,0.5132279992103577,0.5139830112457275,0.5147389769554138,0.5154950022697449,0.5162510275840759,0.5170069932937622,0.5177630186080933,0.5185189843177795,0.5192739963531494,0.5200300216674805,0.5207859873771667,0.5215420126914978,0.5222979784011841,0.5230540037155151,0.5238100290298462,0.5245649814605713,0.5253210067749023,0.5260769724845886,0.5268329977989197,0.5275890231132507,0.528344988822937,0.5291010141372681,0.5298560261726379,0.5306119918823242,0.5313680171966553,0.5321239829063416,0.5328800082206726,0.5336359739303589,0.5343919992446899,0.5351470112800598,0.5359029769897461,0.5366590023040771,0.5374150276184082,0.5381709933280945,0.5389270186424255,0.5396829843521118,0.5404379963874817,0.5411940217018127,0.541949987411499,0.5427060127258301,0.5434619784355164,0.5442180037498474,0.5449740290641785,0.5457289814949036,0.5464850068092346,0.5472409725189209,0.547996997833252,0.548753023147583,0.5495089888572693,0.5502650141716003,0.5510200262069702,0.5517759919166565,0.5525320172309875,0.5532879829406738,0.5540440082550049,0.5547999739646912,0.5555559992790222,0.5563110113143921,0.5570669770240784,0.5578230023384094,0.5585790276527405,0.5593349933624268,0.5600910186767578,0.5608469843864441,0.561601996421814,0.562358021736145,0.5631139874458313,0.5638700127601624,0.5646259784698486,0.5653820037841797,0.5661380290985107,0.5668929815292358,0.5676490068435669,0.5684049725532532,0.5691609978675842,0.5699170231819153,0.5706729888916016,0.5714290142059326,0.5721840262413025,0.5729399919509888,0.5736960172653198,0.5744519829750061,0.5752080082893372,0.5759639739990234,0.5767199993133545,0.5774750113487244,0.5782309770584106,0.5789870023727417,0.5797430276870728,0.580498993396759,0.5812550187110901,0.5820109844207764,0.5827659964561462,0.5835220217704773,0.5842779874801636,0.5850340127944946,0.5857899785041809,0.586546003818512,0.587302029132843,0.5880569815635681,0.5888130068778992,0.5895689725875854,0.5903249979019165,0.5910810232162476,0.5918369889259338,0.5925930142402649,0.5933480262756348,0.594103991985321,0.5948600172996521,0.5956159830093384,0.5963720083236694,0.5971279740333557,0.5978839993476868,0.5986390113830566,0.5993949770927429,0.600151002407074,0.600907027721405,0.6016629934310913,0.6024190187454224,0.6031749844551086,0.6039299964904785,0.6046860218048096,0.6054419875144958,0.6061980128288269,0.6069539785385132,0.6077100038528442,0.6084660291671753,0.6092209815979004,0.6099770069122314,0.6107329726219177,0.6114889979362488,0.6122450232505798,0.6130009889602661,0.6137570142745972,0.614512026309967,0.6152679920196533,0.6160240173339844,0.6167799830436707,0.6175360083580017,0.618291974067688,0.619047999382019,0.6198030114173889,0.6205589771270752,0.6213150024414062,0.6220710277557373,0.6228269934654236,0.6235830187797546,0.6243389844894409,0.6250939965248108,0.6258500218391418,0.6266059875488281,0.6273620128631592,0.6281179785728455,0.6288740038871765,0.6296300292015076,0.6303849816322327,0.6311410069465637,0.63189697265625,0.632652997970581,0.6334090232849121,0.6341649889945984,0.6349210143089294,0.6356769800186157,0.6364319920539856,0.6371880173683167,0.6379439830780029,0.638700008392334,0.6394559741020203,0.6402119994163513,0.6409670114517212,0.6417229771614075,0.6424790024757385,0.6432350277900696,0.6439909934997559,0.6447470188140869,0.6455029845237732,0.6462590098381042,0.6470140218734741,0.6477699875831604,0.6485260128974915,0.6492819786071777,0.6500380039215088,0.6507940292358398,0.6515499949455261,0.652305006980896,0.6530609726905823,0.6538169980049133,0.6545730233192444,0.6553289890289307,0.6560850143432617,0.656840980052948,0.6575959920883179,0.6583520174026489,0.6591079831123352,0.6598640084266663,0.6606199741363525,0.6613759994506836,0.6621320247650146,0.6628869771957397,0.6636430025100708,0.6643990278244019,0.6651549935340881,0.6659110188484192,0.6666669845581055,0.6674230098724365,0.6681780219078064,0.6689339876174927,0.6696900129318237,0.67044597864151,0.6712020039558411,0.6719580292701721,0.6727139949798584,0.6734690070152283,0.6742249727249146,0.6749809980392456,0.6757370233535767,0.6764929890632629,0.677249014377594,0.6780049800872803,0.6787599921226501,0.6795160174369812,0.6802719831466675,0.6810280084609985,0.6817839741706848,0.6825399994850159,0.6832960247993469,0.684050977230072,0.6848070025444031,0.6855630278587341,0.6863189935684204,0.6870750188827515,0.6878309845924377,0.6885870099067688,0.6893420219421387,0.690097987651825,0.690854012966156,0.6916099786758423,0.6923660039901733,0.6931220293045044,0.6938779950141907,0.6946330070495605,0.6953889727592468,0.6961449980735779,0.6969010233879089,0.6976569890975952,0.6984130144119263,0.6991689801216125,0.6999239921569824,0.7006800174713135,0.7014359831809998,0.7021920084953308,0.7029479742050171,0.7037039995193481,0.7044600248336792,0.7052149772644043,0.7059710025787354,0.7067270278930664,0.7074829936027527,0.7082390189170837,0.70899498462677,0.7097510099411011,0.710506021976471,0.7112619876861572,0.7120180130004883,0.7127739787101746,0.7135300040245056,0.7142860293388367,0.715041995048523,0.7157970070838928,0.7165529727935791,0.7173089981079102,0.7180650234222412,0.7188209891319275,0.7195770144462585,0.7203329801559448,0.7210879921913147,0.7218440175056458,0.722599983215332,0.7233560085296631,0.7241119742393494,0.7248679995536804,0.7256240248680115,0.7263789772987366,0.7271350026130676,0.7278910279273987,0.728646993637085,0.729403018951416,0.7301589846611023,0.7309150099754333,0.7316700220108032,0.7324259877204895,0.7331820130348206,0.7339379787445068,0.7346940040588379,0.735450029373169,0.7362059950828552,0.7369610071182251,0.7377169728279114,0.7384729981422424,0.7392290234565735,0.7399849891662598,0.7407410144805908,0.7414969801902771,0.742251992225647,0.743008017539978,0.7437639832496643,0.7445200085639954,0.7452759742736816,0.7460319995880127,0.7467880249023438,0.7475429773330688,0.7482990026473999,0.749055027961731,0.7498109936714172,0.7505670189857483,0.7513229846954346,0.7520790100097656,0.7528340220451355,0.7535899877548218,0.7543460130691528,0.7551019787788391,0.7558580040931702,0.7566140294075012,0.7573699951171875,0.7581250071525574,0.7588809728622437,0.7596369981765747,0.7603930234909058,0.761148989200592,0.7619050145149231,0.7626609802246094,0.7634159922599792,0.7641720175743103,0.7649279832839966,0.7656840085983276,0.7664399743080139,0.767195999622345,0.767952024936676,0.7687069773674011,0.7694630026817322,0.7702190279960632,0.7709749937057495,0.7717310190200806,0.7724869847297668,0.7732430100440979,0.7739980220794678,0.774753987789154,0.7755100131034851,0.7762659788131714,0.7770220041275024,0.7777780294418335,0.7785339951515198,0.7792890071868896,0.7800449728965759,0.780800998210907,0.781557023525238,0.7823129892349243,0.7830690145492554,0.7838249802589417,0.7845799922943115,0.7853360176086426,0.7860919833183289,0.7868480086326599,0.7876039743423462,0.7883599996566772,0.7891160249710083,0.7898719906806946,0.7906270027160645,0.7913830280303955,0.7921389937400818,0.7928950190544128,0.7936509847640991,0.7944070100784302,0.7951620221138,0.7959179878234863,0.7966740131378174,0.7974299788475037,0.7981860041618347,0.7989420294761658,0.799697995185852,0.8004540205001831,0.8012089729309082,0.8019649982452393,0.8027210235595703,0.8034769892692566,0.8042330145835876,0.8049889802932739,0.805745005607605,0.8065000176429749,0.8072559833526611,0.8080120086669922,0.8087679743766785,0.8095239996910095,0.8102800250053406,0.8110359907150269,0.8117910027503967,0.8125470280647278,0.8133029937744141,0.8140590190887451,0.8148149847984314,0.8155710101127625,0.8163269758224487,0.8170819878578186,0.8178380131721497,0.8185939788818359,0.819350004196167,0.820106029510498,0.8208619952201843,0.8216180205345154,0.8223729729652405,0.8231289982795715,0.8238850235939026,0.8246409893035889,0.8253970146179199,0.8261529803276062,0.8269090056419373,0.8276640176773071,0.8284199833869934,0.8291760087013245,0.8299319744110107,0.8306879997253418,0.8314440250396729,0.8321999907493591,0.832955002784729,0.8337110280990601,0.8344669938087463,0.8352230191230774,0.8359789848327637,0.8367350101470947,0.837490975856781,0.8382459878921509,0.8390020132064819,0.8397579789161682,0.8405140042304993,0.8412700295448303,0.8420259952545166,0.8427820205688477,0.8435369729995728,0.8442929983139038,0.8450490236282349,0.8458049893379211,0.8465610146522522,0.8473169803619385,0.8480730056762695,0.8488280177116394,0.8495839834213257,0.8503400087356567,0.851095974445343,0.8518519997596741,0.8526080250740051,0.8533639907836914,0.8541190028190613,0.8548750281333923,0.8556309938430786,0.8563870191574097,0.857142984867096,0.857899010181427,0.8586549758911133,0.8594099879264832,0.8601660132408142,0.8609219789505005,0.8616780042648315,0.8624340295791626,0.8631899952888489,0.8639460206031799,0.864700973033905,0.8654569983482361,0.8662130236625671,0.8669689893722534,0.8677250146865845,0.8684809803962708,0.8692370057106018,0.8699920177459717,0.870747983455658,0.871504008769989,0.8722599744796753,0.8730159997940063,0.8737720251083374,0.8745279908180237,0.8752830028533936,0.8760390281677246,0.8767949938774109,0.8775510191917419,0.8783069849014282,0.8790630102157593,0.8798189759254456,0.8805739879608154,0.8813300132751465,0.8820859789848328,0.8828420042991638,0.8835980296134949,0.8843539953231812,0.8851100206375122,0.8858649730682373,0.8866209983825684,0.8873770236968994,0.8881329894065857,0.8888890147209167,0.889644980430603,0.8904010057449341,0.891156017780304,0.8919119834899902,0.8926680088043213,0.8934239745140076,0.8941799998283386,0.8949360251426697,0.895691990852356,0.8964470028877258,0.8972030282020569,0.8979589939117432,0.8987150192260742,0.8994709849357605,0.9002270102500916,0.9009829759597778,0.9017379879951477,0.9024940133094788,0.903249979019165,0.9040060043334961,0.9047620296478271,0.9055179953575134,0.9062740206718445,0.9070289731025696,0.9077849984169006,0.9085410237312317,0.909296989440918,0.910053014755249,0.9108089804649353,0.9115650057792664,0.9123200178146362,0.9130759835243225,0.9138320088386536,0.9145879745483398,0.9153439998626709,0.916100025177002,0.9168559908866882,0.9176110029220581,0.9183670282363892,0.9191229939460754,0.9198790192604065,0.9206349849700928,0.9213910102844238,0.9221469759941101,0.92290198802948,0.923658013343811,0.9244139790534973,0.9251700043678284,0.9259260296821594,0.9266819953918457,0.9274380207061768,0.928193986415863,0.9289489984512329,0.929705023765564,0.9304609894752502,0.9312170147895813,0.9319729804992676,0.9327290058135986,0.9334840178489685,0.9342399835586548,0.9349960088729858,0.9357519745826721,0.9365079998970032,0.9372640252113342,0.9380199909210205,0.9387760162353516,0.9395310282707214,0.9402869939804077,0.9410430192947388,0.941798985004425,0.9425550103187561,0.9433109760284424,0.9440670013427734,0.9448220133781433,0.9455779790878296,0.9463340044021606,0.9470900297164917,0.947845995426178,0.948602020740509,0.9493579864501953,0.9501129984855652,0.9508690237998962,0.9516249895095825,0.9523810148239136,0.9531369805335999,0.9538930058479309,0.9546489715576172,0.9554039835929871,0.9561600089073181,0.9569159746170044,0.9576719999313354,0.9584280252456665,0.9591839909553528,0.9599400162696838,0.9606950283050537,0.96145099401474,0.962207019329071,0.9629629850387573,0.9637190103530884,0.9644749760627747,0.9652310013771057,0.9659860134124756,0.9667419791221619,0.9674980044364929,0.968254029750824,0.9690099954605103,0.9697660207748413,0.9705219864845276,0.9712769985198975,0.9720330238342285,0.9727889895439148,0.9735450148582458,0.9743009805679321,0.9750570058822632,0.9758129715919495,0.9765679836273193,0.9773240089416504,0.9780799746513367,0.9788359999656677,0.9795920252799988,0.9803479909896851,0.9811040163040161,0.981859028339386,0.9826149940490723,0.9833710193634033,0.9841269850730896,0.9848830103874207,0.9856389760971069,0.986395001411438,0.9871500134468079,0.9879059791564941,0.9886620044708252,0.9894180297851562,0.9901739954948425,0.9909300208091736,0.9916859865188599,0.9924409985542297,0.9931970238685608,0.9939529895782471,0.9947090148925781,0.9954649806022644,0.9962210059165955,0.9969769716262817,0.9977319836616516,0.9984880089759827,0.999243974685669,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.999243974685669,0.9984880089759827,0.9977319836616516,0.9969769716262817,0.9962210059165955,0.9954649806022644,0.9947090148925781,0.9939529895782471,0.9931970238685608,0.9924409985542297,0.9916859865188599,0.9909300208091736,0.9901739954948425,0.9894180297851562,0.9886620044708252,0.9879059791564941,0.9871500134468079,0.986395001411438,0.9856389760971069,0.9848830103874207,0.9841269850730896,0.9833710193634033,0.9826149940490723,0.981859028339386,0.9811040163040161,0.9803479909896851,0.9795920252799988,0.9788359999656677,0.9780799746513367,0.9773240089416504,0.9765679836273193,0.9758129715919495,0.9750570058822632,0.9743009805679321,0.9735450148582458,0.9727889895439148,0.9720330238342285,0.9712769985198975,0.9705219864845276,0.9697660207748413,0.9690099954605103,0.968254029750824,0.9674980044364929,0.9667419791221619,0.9659860134124756,0.9652310013771057,0.9644749760627747,0.9637190103530884,0.9629629850387573,0.962207019329071,0.96145099401474,0.9606950283050537,0.9599400162696838,0.9591839909553528,0.9584280252456665,0.9576719999313354,0.9569159746170044,0.9561600089073181,0.9554039835929871,0.9546480178833008,0.9538930058479309,0.9531369805335999,0.9523810148239136,0.9516249895095825,0.9508690237998962,0.9501129984855652,0.9493579864501953,0.948602020740509,0.947845995426178,0.9470900297164917,0.9463340044021606,0.9455779790878296,0.9448220133781433,0.9440670013427734,0.9433109760284424,0.9425550103187561,0.941798985004425,0.9410430192947388,0.9402869939804077,0.9395310282707214,0.9387760162353516,0.9380199909210205,0.9372640252113342,0.9365079998970032,0.9357519745826721,0.9349960088729858,0.9342399835586548,0.9334840178489685,0.9327290058135986,0.9319729804992676,0.9312170147895813,0.9304609894752502,0.929705023765564,0.9289489984512329,0.928193986415863,0.9274380207061768,0.9266819953918457,0.9259260296821594,0.9251700043678284,0.9244139790534973,0.923658013343811,0.92290198802948,0.9221469759941101,0.9213910102844238,0.9206349849700928,0.9198790192604065,0.9191229939460754,0.9183670282363892,0.9176110029220581,0.9168559908866882,0.916100025177002,0.9153439998626709,0.9145879745483398,0.9138320088386536,0.9130759835243225,0.9123200178146362,0.9115650057792664,0.9108089804649353,0.910053014755249,0.909296989440918,0.9085410237312317,0.9077849984169006,0.9070299863815308,0.9062740206718445,0.9055179953575134,0.9047620296478271,0.9040060043334961,0.903249979019165,0.9024940133094788,0.9017379879951477,0.9009829759597778,0.9002270102500916,0.8994709849357605,0.8987150192260742,0.8979589939117432,0.8972030282020569,0.8964470028877258,0.895691990852356,0.8949360251426697,0.8941799998283386,0.8934239745140076,0.8926680088043213,0.8919119834899902,0.891156017780304,0.8904010057449341,0.889644980430603,0.8888890147209167,0.8881329894065857,0.8873770236968994,0.8866209983825684,0.8858649730682373,0.8851100206375122,0.8843539953231812,0.8835980296134949,0.8828420042991638,0.8820859789848328,0.8813300132751465,0.8805739879608154,0.8798189759254456,0.8790630102157593,0.8783069849014282,0.8775510191917419,0.8767949938774109,0.8760390281677246,0.8752830028533936,0.8745279908180237,0.8737720251083374,0.8730159997940063,0.8722599744796753,0.871504008769989,0.870747983455658,0.8699920177459717,0.8692370057106018,0.8684809803962708,0.8677250146865845,0.8669689893722534,0.8662130236625671,0.8654569983482361,0.864700973033905,0.8639460206031799,0.8631899952888489,0.8624340295791626,0.8616780042648315,0.8609219789505005,0.8601660132408142,0.8594099879264832,0.8586549758911133,0.857899010181427,0.857142984867096,0.8563870191574097,0.8556309938430786,0.8548750281333923,0.8541190028190613,0.8533639907836914,0.8526080250740051,0.8518519997596741,0.851095974445343,0.8503400087356567,0.8495839834213257,0.8488280177116394,0.8480730056762695,0.8473169803619385,0.8465610146522522,0.8458049893379211,0.8450490236282349,0.8442929983139038,0.8435369729995728,0.8427820205688477,0.8420259952545166,0.8412700295448303,0.8405140042304993,0.8397579789161682,0.8390020132064819,0.8382459878921509,0.837490975856781,0.8367350101470947,0.8359789848327637,0.8352230191230774,0.8344669938087463,0.8337110280990601,0.832955002784729,0.8321999907493591,0.8314440250396729,0.8306879997253418,0.8299319744110107,0.8291760087013245,0.8284199833869934,0.8276640176773071,0.8269090056419373,0.8261529803276062,0.8253970146179199,0.8246409893035889,0.8238850235939026,0.8231289982795715,0.8223729729652405,0.8216180205345154,0.8208619952201843,0.820106029510498,0.819350004196167,0.8185939788818359,0.8178380131721497,0.8170819878578186,0.8163260221481323,0.8155710101127625,0.8148149847984314,0.8140590190887451,0.8133029937744141,0.8125470280647278,0.8117910027503967,0.8110359907150269,0.8102800250053406,0.8095239996910095,0.8087679743766785,0.8080120086669922,0.8072559833526611,0.8065000176429749,0.805745005607605,0.8049889802932739,0.8042330145835876,0.8034769892692566,0.8027210235595703,0.8019649982452393,0.8012089729309082,0.8004540205001831,0.799697995185852,0.7989420294761658,0.7981860041618347,0.7974299788475037,0.7966740131378174,0.7959179878234863,0.7951620221138,0.7944070100784302,0.7936509847640991,0.7928950190544128,0.7921389937400818,0.7913830280303955,0.7906270027160645,0.7898719906806946,0.7891160249710083,0.7883599996566772,0.7876039743423462,0.7868480086326599,0.7860919833183289,0.7853360176086426,0.7845799922943115,0.7838249802589417,0.7830690145492554,0.7823129892349243,0.781557023525238,0.780800998210907,0.7800449728965759,0.7792890071868896,0.7785339951515198,0.7777780294418335,0.7770220041275024,0.7762659788131714,0.7755100131034851,0.774753987789154,0.7739980220794678,0.7732430100440979,0.7724869847297668,0.7717310190200806,0.7709749937057495,0.7702190279960632,0.7694630026817322,0.7687079906463623,0.767952024936676,0.767195999622345,0.7664399743080139,0.7656840085983276,0.7649279832839966,0.7641720175743103,0.7634159922599792,0.7626609802246094,0.7619050145149231,0.761148989200592,0.7603930234909058,0.7596369981765747,0.7588809728622437,0.7581250071525574,0.7573699951171875,0.7566140294075012,0.7558580040931702,0.7551019787788391,0.7543460130691528,0.7535899877548218,0.7528340220451355,0.7520790100097656,0.7513229846954346,0.7505670189857483,0.7498109936714172,0.749055027961731,0.7482990026473999,0.7475429773330688,0.7467880249023438,0.7460319995880127,0.7452759742736816,0.7445200085639954,0.7437639832496643,0.743008017539978,0.742251992225647,0.7414969801902771,0.7407410144805908,0.7399849891662598,0.7392290234565735,0.7384729981422424,0.7377169728279114,0.7369610071182251,0.7362059950828552,0.735450029373169,0.7346940040588379,0.7339379787445068,0.7331820130348206,0.7324259877204895,0.7316700220108032,0.7309150099754333,0.7301589846611023,0.729403018951416,0.728646993637085,0.7278910279273987,0.7271350026130676,0.7263789772987366,0.7256240248680115,0.7248679995536804,0.7241119742393494,0.7233560085296631,0.722599983215332,0.7218440175056458,0.7210879921913147,0.7203329801559448,0.7195770144462585,0.7188209891319275,0.7180650234222412,0.7173089981079102,0.7165529727935791,0.7157970070838928,0.715041995048523,0.7142860293388367,0.7135300040245056,0.7127739787101746,0.7120180130004883,0.7112619876861572,0.710506021976471,0.7097510099411011,0.70899498462677,0.7082390189170837,0.7074829936027527,0.7067270278930664,0.7059710025787354,0.7052149772644043,0.7044600248336792,0.7037039995193481,0.7029479742050171,0.7021920084953308,0.7014359831809998,0.7006800174713135,0.6999239921569824,0.6991689801216125,0.6984130144119263,0.6976569890975952,0.6969010233879089,0.6961449980735779,0.6953889727592468,0.6946330070495605,0.6938779950141907,0.6931220293045044,0.6923660039901733,0.6916099786758423,0.690854012966156,0.690097987651825,0.6893420219421387,0.6885870099067688,0.6878309845924377,0.6870750188827515,0.6863189935684204,0.6855630278587341,0.6848070025444031,0.684050977230072,0.6832960247993469,0.6825399994850159,0.6817839741706848,0.6810280084609985,0.6802719831466675,0.6795160174369812,0.6787599921226501,0.6780049800872803,0.677249014377594,0.6764929890632629,0.6757370233535767,0.6749809980392456,0.6742249727249146,0.6734690070152283,0.6727139949798584,0.6719580292701721,0.6712020039558411,0.67044597864151,0.6696900129318237,0.6689339876174927,0.6681780219078064,0.6674230098724365,0.6666669845581055,0.6659110188484192,0.6651549935340881,0.6643990278244019,0.6636430025100708,0.6628869771957397,0.6621320247650146,0.6613759994506836,0.6606199741363525,0.6598640084266663,0.6591079831123352,0.6583520174026489,0.6575959920883179,0.656840980052948,0.6560850143432617,0.6553289890289307,0.6545730233192444,0.6538169980049133,0.6530609726905823,0.652305006980896,0.6515499949455261,0.6507940292358398,0.6500380039215088,0.6492819786071777,0.6485260128974915,0.6477699875831604,0.6470140218734741,0.6462579965591431,0.6455029845237732,0.6447470188140869,0.6439909934997559,0.6432350277900696,0.6424790024757385,0.6417229771614075,0.6409670114517212,0.6402119994163513,0.6394559741020203,0.638700008392334,0.6379439830780029,0.6371880173683167,0.6364319920539856,0.6356769800186157,0.6349210143089294,0.6341649889945984,0.6334090232849121,0.632652997970581,0.63189697265625,0.6311410069465637,0.6303859949111938,0.6296300292015076,0.6288740038871765,0.6281179785728455,0.6273620128631592,0.6266059875488281,0.6258500218391418,0.6250939965248108,0.6243389844894409,0.6235830187797546,0.6228269934654236,0.6220710277557373,0.6213150024414062,0.6205589771270752,0.6198030114173889,0.619047999382019,0.618291974067688,0.6175360083580017,0.6167799830436707,0.6160240173339844,0.6152679920196533,0.614512026309967,0.6137570142745972,0.6130009889602661,0.6122450232505798,0.6114889979362488,0.6107329726219177,0.6099770069122314,0.6092209815979004,0.6084660291671753,0.6077100038528442,0.6069539785385132,0.6061980128288269,0.6054419875144958,0.6046860218048096,0.6039299964904785,0.6031749844551086,0.6024190187454224,0.6016629934310913,0.600907027721405,0.600151002407074,0.5993949770927429,0.5986390113830566,0.5978839993476868,0.5971279740333557,0.5963720083236694,0.5956159830093384,0.5948600172996521,0.594103991985321,0.5933480262756348,0.5925930142402649,0.5918369889259338,0.5910810232162476,0.5903249979019165,0.5895689725875854,0.5888130068778992,0.5880569815635681,0.587302029132843,0.586546003818512,0.5857899785041809,0.5850340127944946,0.5842779874801636,0.5835220217704773,0.5827659964561462,0.5820109844207764,0.5812550187110901,0.580498993396759,0.5797430276870728,0.5789870023727417,0.5782309770584106,0.5774750113487244,0.5767199993133545,0.5759639739990234,0.5752080082893372,0.5744519829750061,0.5736960172653198,0.5729399919509888,0.5721840262413025,0.5714290142059326,0.5706729888916016,0.5699170231819153,0.5691609978675842,0.5684049725532532,0.5676490068435669,0.5668929815292358,0.5661380290985107,0.5653820037841797,0.5646259784698486,0.5638700127601624,0.5631139874458313,0.562358021736145,0.561601996421814,0.5608469843864441,0.5600910186767578,0.5593349933624268,0.5585790276527405,0.5578230023384094,0.5570669770240784,0.5563110113143921,0.5555559992790222,0.5547999739646912,0.5540440082550049,0.5532879829406738,0.5525320172309875,0.5517759919166565,0.5510200262069702,0.5502650141716003,0.5495089888572693,0.548753023147583,0.547996997833252,0.5472409725189209,0.5464850068092346,0.5457289814949036,0.5449740290641785,0.5442180037498474,0.5434619784355164,0.5427060127258301,0.541949987411499,0.5411940217018127,0.5404379963874817,0.5396829843521118,0.5389270186424255,0.5381709933280945,0.5374150276184082,0.5366590023040771,0.5359029769897461,0.5351470112800598,0.5343919992446899,0.5336359739303589,0.5328800082206726,0.5321239829063416,0.5313680171966553,0.5306119918823242,0.5298560261726379,0.5291010141372681,0.528344988822937,0.5275890231132507,0.5268329977989197,0.5260769724845886,0.5253210067749023,0.5245649814605713,0.5238100290298462,0.5230540037155151,0.5222979784011841,0.5215420126914978,0.5207859873771667,0.5200300216674805,0.5192739963531494,0.5185189843177795,0.5177630186080933,0.5170069932937622,0.5162510275840759,0.5154950022697449,0.5147389769554138,0.5139830112457275,0.5132279992103577,0.5124719738960266,0.5117160081863403,0.5109599828720093,0.510204017162323,0.5094479918479919,0.5086920261383057,0.5079360008239746,0.5071809887886047,0.5064250230789185,0.5056689977645874,0.5049129724502563,0.5041570067405701,0.503400981426239,0.5026450157165527,0.5018900036811829,0.5011339783668518,0.5003780126571655,0.4996219873428345,0.4988659918308258,0.49810999631881714,0.49735501408576965,0.4965989887714386,0.49584299325942993,0.49508699774742126,0.4943310022354126,0.49357500672340393,0.49281901121139526,0.4920629858970642,0.4913080036640167,0.49055200815200806,0.4897960126399994,0.48903998732566833,0.48828399181365967,0.487527996301651,0.48677200078964233,0.48601698875427246,0.4852609932422638,0.4845049977302551,0.48374900221824646,0.4829930067062378,0.4822370111942291,0.48148098587989807,0.4807260036468506,0.4799700081348419,0.47921401262283325,0.4784579873085022,0.47770199179649353,0.47694599628448486,0.4761900007724762,0.4754349887371063,0.47467899322509766,0.473922997713089,0.4731670022010803,0.47241100668907166,0.471655011177063,0.47089898586273193,0.47014400362968445,0.4693880081176758,0.4686320126056671,0.46787598729133606,0.4671199917793274,0.4663639962673187,0.46560800075531006,0.4648529887199402,0.4640969932079315,0.46334099769592285,0.4625850021839142,0.4618290066719055,0.46107301115989685,0.4603169858455658,0.4595620036125183,0.45880600810050964,0.458050012588501,0.4572939872741699,0.45653799176216125,0.4557819962501526,0.4550260007381439,0.45427098870277405,0.4535149931907654,0.4527589976787567,0.45200300216674805,0.4512470066547394,0.4504910111427307,0.44973498582839966,0.4489800035953522,0.4482240080833435,0.44746801257133484,0.4467119872570038,0.4459559917449951,0.44519999623298645,0.4444440007209778,0.4436889886856079,0.44293299317359924,0.4421769976615906,0.4414210021495819,0.44066500663757324,0.4399090111255646,0.4391529858112335,0.43839800357818604,0.43764200806617737,0.4368860125541687,0.43612998723983765,0.435373991727829,0.4346179962158203,0.43386200070381165,0.4331069886684418,0.4323509931564331,0.43159499764442444,0.43083900213241577,0.4300830066204071,0.42932701110839844,0.4285709857940674,0.4278160035610199,0.42706000804901123,0.42630401253700256,0.4255479872226715,0.42479199171066284,0.4240359961986542,0.4232800006866455,0.42252498865127563,0.42176899313926697,0.4210129976272583,0.42025700211524963,0.41950100660324097,0.4187450110912323,0.41798898577690125,0.41723400354385376,0.4164780080318451,0.4157220125198364,0.41496598720550537,0.4142099916934967,0.41345399618148804,0.41269800066947937,0.4119429886341095,0.41118699312210083,0.41043099761009216,0.4096750020980835,0.40891900658607483,0.40816301107406616,0.4074069857597351,0.4066520035266876,0.40589600801467896,0.4051400125026703,0.40438398718833923,0.40362799167633057,0.4028719961643219,0.40211600065231323,0.40136098861694336,0.4006049931049347,0.399848997592926,0.39909300208091736,0.3983370065689087,0.3975810110569,0.39682498574256897,0.3960700035095215,0.3953140079975128,0.39455801248550415,0.3938019871711731,0.39304599165916443,0.39228999614715576,0.3915340006351471,0.3907789885997772,0.39002299308776855,0.3892669975757599,0.3885110020637512,0.38775500655174255,0.3869990110397339,0.38624298572540283,0.38548800349235535,0.3847320079803467,0.383976012468338,0.38321998715400696,0.3824639916419983,0.3817079961299896,0.38095200061798096,0.3801969885826111,0.3794409930706024,0.37868499755859375,0.3779290020465851,0.3771730065345764,0.37641701102256775,0.3756609857082367,0.3749060034751892,0.37415000796318054,0.3733940124511719,0.3726379871368408,0.37188199162483215,0.3711259961128235,0.3703700006008148,0.36961498856544495,0.3688589930534363,0.3681029975414276,0.36734700202941895,0.3665910065174103,0.3658350110054016,0.36507898569107056,0.3643229901790619,0.3635680079460144,0.36281201243400574,0.3620559871196747,0.361299991607666,0.36054399609565735,0.3597880005836487,0.3590329885482788,0.35827699303627014,0.3575209975242615,0.3567650020122528,0.35600900650024414,0.3552530109882355,0.3544969856739044,0.35374099016189575,0.35298600792884827,0.3522300124168396,0.35147398710250854,0.3507179915904999,0.3499619960784912,0.34920600056648254,0.3484500050544739,0.347694993019104,0.34693899750709534,0.34618300199508667,0.345427006483078,0.34467101097106934,0.3439149856567383,0.3431589901447296,0.34240400791168213,0.34164801239967346,0.3408919870853424,0.34013599157333374,0.3393799960613251,0.3386240005493164,0.33786800503730774,0.33711299300193787,0.3363569974899292,0.33560100197792053,0.33484500646591187,0.3340890109539032,0.33333298563957214,0.3325769901275635,0.331822007894516,0.3310660123825073,0.33030998706817627,0.3295539915561676,0.32879799604415894,0.32804200053215027,0.3272860050201416,0.32653099298477173,0.32577499747276306,0.3250190019607544,0.3242630064487457,0.32350701093673706,0.322750985622406,0.32199499011039734,0.32124000787734985,0.3204840123653412,0.31972798705101013,0.31897199153900146,0.3182159960269928,0.31746000051498413,0.31670400500297546,0.3159489929676056,0.3151929974555969,0.31443700194358826,0.3136810064315796,0.3129250109195709,0.31216898560523987,0.3114129900932312,0.3106580078601837,0.30990201234817505,0.309145987033844,0.3083899915218353,0.30763399600982666,0.306878000497818,0.3061220049858093,0.30536699295043945,0.3046109974384308,0.3038550019264221,0.30309900641441345,0.3023430109024048,0.30158698558807373,0.30083099007606506,0.3000760078430176,0.2993200123310089,0.29856398701667786,0.2978079915046692,0.2970519959926605,0.29629600048065186,0.2955400049686432,0.2947849929332733,0.29402899742126465,0.293273001909256,0.2925170063972473,0.29176101088523865,0.2910049855709076,0.2902489900588989,0.28949400782585144,0.2887380123138428,0.2879819869995117,0.28722599148750305,0.2864699959754944,0.2857140004634857,0.28495800495147705,0.2842029929161072,0.2834469974040985,0.28269100189208984,0.2819350063800812,0.2811790108680725,0.28042298555374146,0.2796669900417328,0.2789120078086853,0.27815601229667664,0.2773999869823456,0.2766439914703369,0.27588799595832825,0.2751320004463196,0.2743760049343109,0.27362099289894104,0.2728649973869324,0.2721090018749237,0.27135300636291504,0.27059701085090637,0.2698409855365753,0.26908499002456665,0.26833000779151917,0.2675740122795105,0.26681798696517944,0.2660619914531708,0.2653059959411621,0.26455000042915344,0.2637940049171448,0.2630389928817749,0.26228299736976624,0.26152700185775757,0.2607710063457489,0.26001501083374023,0.2592589855194092,0.2585029900074005,0.257748007774353,0.25699201226234436,0.2562359869480133,0.25547999143600464,0.25472399592399597,0.2539680004119873,0.25321200489997864,0.25245699286460876,0.2517009973526001,0.25094500184059143,0.25018900632858276,0.2494329959154129,0.24867700040340424,0.24792100489139557,0.2471659928560257,0.24640999734401703,0.24565400183200836,0.2448980063199997,0.24414199590682983,0.24338600039482117,0.2426300048828125,0.24187499284744263,0.24111899733543396,0.2403630018234253,0.23960700631141663,0.23885099589824677,0.2380950003862381,0.23733900487422943,0.23658399283885956,0.2358279973268509,0.23507200181484222,0.23431600630283356,0.2335599958896637,0.23280400037765503,0.23204800486564636,0.2312929928302765,0.23053699731826782,0.22978100180625916,0.2290250062942505,0.22826899588108063,0.22751300036907196,0.2267570048570633,0.22600199282169342,0.22524599730968475,0.2244900017976761,0.22373400628566742,0.22297799587249756,0.2222220003604889,0.22146600484848022,0.22071099281311035,0.21995499730110168,0.21919900178909302,0.21844300627708435,0.2176869958639145,0.21693100035190582,0.21617500483989716,0.21541999280452728,0.21466399729251862,0.21390800178050995,0.21315200626850128,0.21239599585533142,0.21164000034332275,0.2108840048313141,0.21012799441814423,0.20937299728393555,0.20861700177192688,0.2078610062599182,0.20710499584674835,0.20634900033473969,0.20559300482273102,0.20483799278736115,0.20408199727535248,0.2033260017633438,0.20257000625133514,0.20181399583816528,0.20105800032615662,0.20030200481414795,0.1995459944009781,0.1987909972667694,0.19803500175476074,0.19727900624275208,0.19652299582958221,0.19576700031757355,0.19501100480556488,0.19425499439239502,0.19349999725818634,0.19274400174617767,0.191988006234169,0.19123199582099915,0.19047600030899048,0.1897200047969818,0.18896399438381195,0.18820899724960327,0.1874530017375946,0.18669700622558594,0.18594099581241608,0.1851850003004074,0.18442900478839874,0.18367299437522888,0.1829179972410202,0.18216200172901154,0.18140600621700287,0.180649995803833,0.17989400029182434,0.17913800477981567,0.1783819943666458,0.17762699723243713,0.17687100172042847,0.1761150062084198,0.17535899579524994,0.17460300028324127,0.1738470047712326,0.17309099435806274,0.17233599722385406,0.1715800017118454,0.17082400619983673,0.17006799578666687,0.1693120002746582,0.16855600476264954,0.16779999434947968,0.167044997215271,0.16628900170326233,0.16553300619125366,0.1647769957780838,0.16402100026607513,0.16326500475406647,0.1625089943408966,0.16175399720668793,0.16099800169467926,0.1602420061826706,0.15948599576950073,0.15873000025749207,0.1579740047454834,0.15721799433231354,0.15646299719810486,0.1557070016860962,0.15495100617408752,0.15419499576091766,0.153439000248909,0.15268300473690033,0.15192699432373047,0.1511719971895218,0.15041600167751312,0.14966000616550446,0.1489039957523346,0.14814800024032593,0.14739200472831726,0.1466359943151474,0.14588099718093872,0.14512500166893005,0.1443690061569214,0.14361299574375153,0.14285700023174286,0.1421010047197342,0.14134499430656433,0.14058999717235565,0.13983400166034698,0.13907800614833832,0.13832199573516846,0.1375660002231598,0.13681000471115112,0.13605399429798126,0.13529899716377258,0.13454300165176392,0.13378700613975525,0.1330309957265854,0.13227500021457672,0.13151900470256805,0.1307629942893982,0.13000799715518951,0.12925200164318085,0.12849600613117218,0.12773999571800232,0.12698400020599365,0.12622800469398499,0.12547199428081512,0.12471699714660645,0.12396100163459778,0.12320499867200851,0.12244900315999985,0.12169300019741058,0.12093699723482132,0.12018100172281265,0.11942599713802338,0.11867000162601471,0.11791399866342545,0.11715800315141678,0.11640200018882751,0.11564599722623825,0.11489000171422958,0.11413499712944031,0.11337900161743164,0.11262299865484238,0.11186700314283371,0.11111100018024445,0.11035499721765518,0.10959900170564651,0.10884399712085724,0.10808800160884857,0.10733199864625931,0.10657600313425064,0.10582000017166138,0.10506399720907211,0.10430800169706345,0.10355299711227417,0.1027970016002655,0.10204099863767624,0.10128500312566757,0.10052900016307831,0.09977319836616516,0.09901739656925201,0.09826149791479111,0.09750570356845856,0.09674979746341705,0.09599389880895615,0.095238097012043,0.09448219835758209,0.09372639656066895,0.0929706022143364,0.09221459925174713,0.09145879745483398,0.09070300310850143,0.08994709700345993,0.08919130265712738,0.08843539655208588,0.08767949789762497,0.08692370355129242,0.08616779744625092,0.08541200309991837,0.08465609699487686,0.08390019834041595,0.08314439654350281,0.0823884978890419,0.08163270354270935,0.08087679743766785,0.08012089878320694,0.07936509698629379,0.07860919833183289,0.07785339653491974,0.07709749788045883,0.07634159922599792,0.07558579742908478,0.07482989877462387,0.07407409697771072,0.07331819832324982,0.07256229966878891,0.07180649787187576,0.07105059921741486,0.07029479742050171,0.06953900307416916,0.0687830001115799,0.06802719831466675,0.0672713965177536,0.0665154978632927,0.06575970351696014,0.06500379741191864,0.06424789875745773,0.06349209696054459,0.06273619830608368,0.06198040023446083,0.061224501579999924,0.06046859920024872,0.05971280112862587,0.058956898748874664,0.058201100677251816,0.05744519829750061,0.0566892996430397,0.055933501571416855,0.05517759919166565,0.0544218011200428,0.053665898740291595,0.05291000008583069,0.05215419828891754,0.051398299634456635,0.050642501562833786,0.04988659918308258,0.049130700528621674,0.04837489873170853,0.04761900007724762,0.04686319828033447,0.046107400208711624,0.04535140097141266,0.04459559917449951,0.04383980110287666,0.04308389872312546,0.04232810065150261,0.041572198271751404,0.0408162996172905,0.04006050154566765,0.03930459916591644,0.038548801094293594,0.03779289871454239,0.03703700006008148,0.036281198263168335,0.03552529960870743,0.03476950153708458,0.034013599157333374,0.03325770050287247,0.03250189870595932,0.03174600005149841,0.030990200117230415,0.03023429960012436,0.029478399083018303,0.028722599148750305,0.027966700494289398,0.0272109005600214,0.026455000042915344,0.025699200108647346,0.02494329959154129,0.024187399074435234,0.023431599140167236,0.02267579920589924,0.02191990055143833,0.021164000034332275,0.020408200100064278,0.01965229958295822,0.018896499648690224,0.018140599131584167,0.01738470047712326,0.016628900542855263,0.015873000025749207,0.015117200091481209,0.014361299574375153,0.013605399988591671,0.012849600054323673,0.012093699537217617,0.01133789960294962,0.010582000017166138,0.009826119989156723,0.009070280008018017,0.00831442978233099,0.00755858002230525,0.006802740041166544,0.006046889815479517,0.005290990229696035,0.004535140004009008,0.003779290011152625,0.003023450030013919,0.0022676000371575356,0.0015116899739950895,0])
commons_setArray("n1", createFloatArray(100))
commons_getArray("n1").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n2", createFloatArray(100))
commons_getArray("n2").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n3", createFloatArray(100))
commons_getArray("n3").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n4", createFloatArray(100))
commons_getArray("n4").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n5", createFloatArray(100))
commons_getArray("n5").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n6", createFloatArray(100))
commons_getArray("n6").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n7", createFloatArray(100))
commons_getArray("n7").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n8", createFloatArray(100))
commons_getArray("n8").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n9", createFloatArray(100))
commons_getArray("n9").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n10", createFloatArray(100))
commons_getArray("n10").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n11", createFloatArray(100))
commons_getArray("n11").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
commons_setArray("n12", createFloatArray(100))
commons_getArray("n12").set([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])

        function ioRcv_n_0_1_0(m) {n_0_1_RCVS_0(m)}
function ioRcv_n_0_2_0(m) {n_0_2_RCVS_0(m)}
function ioRcv_n_0_6_0(m) {n_0_6_RCVS_0(m)}
function ioRcv_n_0_14_0(m) {n_0_14_RCVS_0(m)}
function ioRcv_n_0_31_0(m) {n_0_31_RCVS_0(m)}
function ioRcv_n_0_35_0(m) {n_0_35_RCVS_0(m)}
function ioRcv_n_0_39_0(m) {n_0_39_RCVS_0(m)}
function ioRcv_n_0_43_0(m) {n_0_43_RCVS_0(m)}
function ioRcv_n_0_47_0(m) {n_0_47_RCVS_0(m)}
function ioRcv_n_0_51_0(m) {n_0_51_RCVS_0(m)}
function ioRcv_n_0_55_0(m) {n_0_55_RCVS_0(m)}
function ioRcv_n_0_59_0(m) {n_0_59_RCVS_0(m)}
function ioRcv_n_0_63_0(m) {n_0_63_RCVS_0(m)}
function ioRcv_n_0_67_0(m) {n_0_67_RCVS_0(m)}
function ioRcv_n_0_71_0(m) {n_0_71_RCVS_0(m)}
function ioRcv_n_0_83_0(m) {n_0_83_RCVS_0(m)}
function ioRcv_n_0_84_0(m) {n_0_84_RCVS_0(m)}
function ioRcv_n_0_85_0(m) {n_0_85_RCVS_0(m)}
function ioRcv_n_0_86_0(m) {n_0_86_RCVS_0(m)}
function ioRcv_n_0_87_0(m) {n_0_87_RCVS_0(m)}
function ioRcv_n_0_88_0(m) {n_0_88_RCVS_0(m)}
function ioRcv_n_0_89_0(m) {n_0_89_RCVS_0(m)}
function ioRcv_n_0_90_0(m) {n_0_90_RCVS_0(m)}
function ioRcv_n_0_91_0(m) {n_0_91_RCVS_0(m)}
function ioRcv_n_0_92_0(m) {n_0_92_RCVS_0(m)}
function ioRcv_n_0_93_0(m) {n_0_93_RCVS_0(m)}
function ioRcv_n_0_94_0(m) {n_0_94_RCVS_0(m)}
function ioRcv_n_0_99_0(m) {n_0_99_RCVS_0(m)}
function ioRcv_n_0_102_0(m) {n_0_102_RCVS_0(m)}
function ioRcv_n_0_107_0(m) {n_0_107_RCVS_0(m)}
function ioRcv_n_0_108_0(m) {n_0_108_RCVS_0(m)}
function ioRcv_n_0_117_0(m) {n_0_117_RCVS_0(m)}
function ioRcv_n_0_118_0(m) {n_0_118_RCVS_0(m)}
function ioRcv_n_0_119_0(m) {n_0_119_RCVS_0(m)}
function ioRcv_n_0_120_0(m) {n_0_120_RCVS_0(m)}
function ioRcv_n_0_129_0(m) {n_0_129_RCVS_0(m)}
function ioRcv_n_0_130_0(m) {n_0_130_RCVS_0(m)}
function ioRcv_n_0_131_0(m) {n_0_131_RCVS_0(m)}
function ioRcv_n_0_132_0(m) {n_0_132_RCVS_0(m)}
function ioRcv_n_0_135_0(m) {n_0_135_RCVS_0(m)}
function ioRcv_n_0_140_0(m) {n_0_140_RCVS_0(m)}
function ioRcv_n_0_141_0(m) {n_0_141_RCVS_0(m)}
function ioRcv_n_0_144_0(m) {n_0_144_RCVS_0(m)}
function ioRcv_n_0_158_0(m) {n_0_158_RCVS_0(m)}
function ioRcv_n_0_159_0(m) {n_0_159_RCVS_0(m)}
function ioRcv_n_0_177_0(m) {n_0_177_RCVS_0(m)}
function ioRcv_n_0_178_0(m) {n_0_178_RCVS_0(m)}
        

        
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
                    n_0_1_STATE.messageSender = n_0_5_RCVS_0
                    n_control_setReceiveBusName(n_0_1_STATE, "empty")
                })
    
                
            

        const n_0_5_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: n_0_2_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_0_5_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_0_5_STATE, 20000)
            n_0_5_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_0_5_STATE)
            }
        })
    

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
            n_0_2_STATE.messageSender = n_0_3_RCVS_0
            n_control_setReceiveBusName(n_0_2_STATE, "empty")
        })

        
    

            const n_0_3_STATE = {
                busName: "tempo",
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
            n_0_6_STATE.messageSender = n_0_9_RCVS_0
            n_control_setReceiveBusName(n_0_6_STATE, "empty")
        })

        
    


        const n_0_83_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_83_STATE.outTemplates[0] = []
            
                n_0_83_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_83_STATE.outTemplates[0].push(4)
            

                n_0_83_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_83_STATE.outTemplates[0].push(7)
            

                n_0_83_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_83_STATE.outTemplates[0].push(5)
            

                n_0_83_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_83_STATE.outTemplates[0].push(2)
            
            n_0_83_STATE.outMessages[0] = msg_create(n_0_83_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_83_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_83_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_83_STATE.outMessages[0], 2, "1.wav")
            

                msg_writeStringToken(n_0_83_STATE.outMessages[0], 3, "n1")
            
        
        
        n_0_83_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_83_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_8_STATE = {
            operations: new Map(),
        }
    

        const n_0_12_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_12_STATE, 0)
            n_div_setRight(n_0_12_STATE, 1)
        

        const n_0_13_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_13_STATE, 0)
            n_mul_setRight(n_0_13_STATE, 1000)
        

            const n_0_14_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_14_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_14_STATE, m)
                }
                n_0_14_STATE.messageSender = n_0_14_SNDS_0
                n_control_setReceiveBusName(n_0_14_STATE, "empty")
            })
        

            const n_0_27_STATE = {
                busName: "totalSampleLength_n1",
            }
        


        const n_0_99_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_99_STATE.outTemplates[0] = []
            
                n_0_99_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_99_STATE.outMessages[0] = msg_create(n_0_99_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_99_STATE.outMessages[0], 0, 0)
            
        
        
        n_0_99_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_99_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_84_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_84_STATE.outTemplates[0] = []
            
                n_0_84_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_84_STATE.outTemplates[0].push(4)
            

                n_0_84_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_84_STATE.outTemplates[0].push(7)
            

                n_0_84_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_84_STATE.outTemplates[0].push(5)
            

                n_0_84_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_84_STATE.outTemplates[0].push(2)
            
            n_0_84_STATE.outMessages[0] = msg_create(n_0_84_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_84_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_84_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_84_STATE.outMessages[0], 2, "2.wav")
            

                msg_writeStringToken(n_0_84_STATE.outMessages[0], 3, "n2")
            
        
        
        n_0_84_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_84_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_28_STATE = {
            operations: new Map(),
        }
    

        const n_0_29_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_29_STATE, 0)
            n_div_setRight(n_0_29_STATE, 1)
        

        const n_0_30_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_30_STATE, 0)
            n_mul_setRight(n_0_30_STATE, 1000)
        

            const n_0_31_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_31_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_31_STATE, m)
                }
                n_0_31_STATE.messageSender = n_0_31_SNDS_0
                n_control_setReceiveBusName(n_0_31_STATE, "empty")
            })
        

            const n_0_82_STATE = {
                busName: "totalSampleLength_n2",
            }
        


        const n_0_102_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_102_STATE.outTemplates[0] = []
            
                n_0_102_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_102_STATE.outMessages[0] = msg_create(n_0_102_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_102_STATE.outMessages[0], 0, 1)
            
        
        
        n_0_102_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_102_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_85_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_85_STATE.outTemplates[0] = []
            
                n_0_85_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_85_STATE.outTemplates[0].push(4)
            

                n_0_85_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_85_STATE.outTemplates[0].push(7)
            

                n_0_85_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_85_STATE.outTemplates[0].push(5)
            

                n_0_85_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_85_STATE.outTemplates[0].push(2)
            
            n_0_85_STATE.outMessages[0] = msg_create(n_0_85_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_85_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_85_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_85_STATE.outMessages[0], 2, "3.wav")
            

                msg_writeStringToken(n_0_85_STATE.outMessages[0], 3, "n3")
            
        
        
        n_0_85_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_85_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_32_STATE = {
            operations: new Map(),
        }
    

        const n_0_33_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_33_STATE, 0)
            n_div_setRight(n_0_33_STATE, 1)
        

        const n_0_34_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_34_STATE, 0)
            n_mul_setRight(n_0_34_STATE, 1000)
        

            const n_0_35_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_35_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_35_STATE, m)
                }
                n_0_35_STATE.messageSender = n_0_35_SNDS_0
                n_control_setReceiveBusName(n_0_35_STATE, "empty")
            })
        

            const n_0_81_STATE = {
                busName: "totalSampleLength_n3",
            }
        


        const n_0_107_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_107_STATE.outTemplates[0] = []
            
                n_0_107_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_107_STATE.outMessages[0] = msg_create(n_0_107_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_107_STATE.outMessages[0], 0, 2)
            
        
        
        n_0_107_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_107_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_86_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_86_STATE.outTemplates[0] = []
            
                n_0_86_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_86_STATE.outTemplates[0].push(4)
            

                n_0_86_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_86_STATE.outTemplates[0].push(7)
            

                n_0_86_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_86_STATE.outTemplates[0].push(5)
            

                n_0_86_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_86_STATE.outTemplates[0].push(2)
            
            n_0_86_STATE.outMessages[0] = msg_create(n_0_86_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_86_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_86_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_86_STATE.outMessages[0], 2, "4.wav")
            

                msg_writeStringToken(n_0_86_STATE.outMessages[0], 3, "n4")
            
        
        
        n_0_86_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_86_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_36_STATE = {
            operations: new Map(),
        }
    

        const n_0_37_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_37_STATE, 0)
            n_div_setRight(n_0_37_STATE, 1)
        

        const n_0_38_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_38_STATE, 0)
            n_mul_setRight(n_0_38_STATE, 1000)
        

            const n_0_39_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_39_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_39_STATE, m)
                }
                n_0_39_STATE.messageSender = n_0_39_SNDS_0
                n_control_setReceiveBusName(n_0_39_STATE, "empty")
            })
        

            const n_0_80_STATE = {
                busName: "totalSampleLength_n4",
            }
        


        const n_0_108_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_108_STATE.outTemplates[0] = []
            
                n_0_108_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_108_STATE.outMessages[0] = msg_create(n_0_108_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_108_STATE.outMessages[0], 0, 3)
            
        
        
        n_0_108_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_108_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_87_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_87_STATE.outTemplates[0] = []
            
                n_0_87_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_87_STATE.outTemplates[0].push(4)
            

                n_0_87_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_87_STATE.outTemplates[0].push(7)
            

                n_0_87_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_87_STATE.outTemplates[0].push(5)
            

                n_0_87_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_87_STATE.outTemplates[0].push(2)
            
            n_0_87_STATE.outMessages[0] = msg_create(n_0_87_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_87_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_87_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_87_STATE.outMessages[0], 2, "5.wav")
            

                msg_writeStringToken(n_0_87_STATE.outMessages[0], 3, "n5")
            
        
        
        n_0_87_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_87_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_40_STATE = {
            operations: new Map(),
        }
    

        const n_0_41_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_41_STATE, 0)
            n_div_setRight(n_0_41_STATE, 1)
        

        const n_0_42_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_42_STATE, 0)
            n_mul_setRight(n_0_42_STATE, 1000)
        

            const n_0_43_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_43_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_43_STATE, m)
                }
                n_0_43_STATE.messageSender = n_0_43_SNDS_0
                n_control_setReceiveBusName(n_0_43_STATE, "empty")
            })
        

            const n_0_79_STATE = {
                busName: "totalSampleLength_n5",
            }
        


        const n_0_117_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_117_STATE.outTemplates[0] = []
            
                n_0_117_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_117_STATE.outMessages[0] = msg_create(n_0_117_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_117_STATE.outMessages[0], 0, 4)
            
        
        
        n_0_117_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_117_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_88_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_88_STATE.outTemplates[0] = []
            
                n_0_88_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_88_STATE.outTemplates[0].push(4)
            

                n_0_88_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_88_STATE.outTemplates[0].push(7)
            

                n_0_88_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_88_STATE.outTemplates[0].push(5)
            

                n_0_88_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_88_STATE.outTemplates[0].push(2)
            
            n_0_88_STATE.outMessages[0] = msg_create(n_0_88_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_88_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_88_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_88_STATE.outMessages[0], 2, "6.wav")
            

                msg_writeStringToken(n_0_88_STATE.outMessages[0], 3, "n6")
            
        
        
        n_0_88_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_88_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_44_STATE = {
            operations: new Map(),
        }
    

        const n_0_45_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_45_STATE, 0)
            n_div_setRight(n_0_45_STATE, 1)
        

        const n_0_46_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_46_STATE, 0)
            n_mul_setRight(n_0_46_STATE, 1000)
        

            const n_0_47_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_47_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_47_STATE, m)
                }
                n_0_47_STATE.messageSender = n_0_47_SNDS_0
                n_control_setReceiveBusName(n_0_47_STATE, "empty")
            })
        

            const n_0_78_STATE = {
                busName: "totalSampleLength_n6",
            }
        


        const n_0_118_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_118_STATE.outTemplates[0] = []
            
                n_0_118_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_118_STATE.outMessages[0] = msg_create(n_0_118_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_118_STATE.outMessages[0], 0, 5)
            
        
        
        n_0_118_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_118_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_89_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_89_STATE.outTemplates[0] = []
            
                n_0_89_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_89_STATE.outTemplates[0].push(4)
            

                n_0_89_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_89_STATE.outTemplates[0].push(7)
            

                n_0_89_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_89_STATE.outTemplates[0].push(5)
            

                n_0_89_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_89_STATE.outTemplates[0].push(2)
            
            n_0_89_STATE.outMessages[0] = msg_create(n_0_89_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_89_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_89_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_89_STATE.outMessages[0], 2, "7.wav")
            

                msg_writeStringToken(n_0_89_STATE.outMessages[0], 3, "n7")
            
        
        
        n_0_89_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_89_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_48_STATE = {
            operations: new Map(),
        }
    

        const n_0_49_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_49_STATE, 0)
            n_div_setRight(n_0_49_STATE, 1)
        

        const n_0_50_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_50_STATE, 0)
            n_mul_setRight(n_0_50_STATE, 1000)
        

            const n_0_51_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_51_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_51_STATE, m)
                }
                n_0_51_STATE.messageSender = n_0_51_SNDS_0
                n_control_setReceiveBusName(n_0_51_STATE, "empty")
            })
        

            const n_0_77_STATE = {
                busName: "totalSampleLength_n7",
            }
        


        const n_0_119_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_119_STATE.outTemplates[0] = []
            
                n_0_119_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_119_STATE.outMessages[0] = msg_create(n_0_119_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_119_STATE.outMessages[0], 0, 6)
            
        
        
        n_0_119_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_119_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_90_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_90_STATE.outTemplates[0] = []
            
                n_0_90_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_90_STATE.outTemplates[0].push(4)
            

                n_0_90_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_90_STATE.outTemplates[0].push(7)
            

                n_0_90_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_90_STATE.outTemplates[0].push(5)
            

                n_0_90_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_90_STATE.outTemplates[0].push(2)
            
            n_0_90_STATE.outMessages[0] = msg_create(n_0_90_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_90_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_90_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_90_STATE.outMessages[0], 2, "8.wav")
            

                msg_writeStringToken(n_0_90_STATE.outMessages[0], 3, "n8")
            
        
        
        n_0_90_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_90_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_52_STATE = {
            operations: new Map(),
        }
    

        const n_0_53_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_53_STATE, 0)
            n_div_setRight(n_0_53_STATE, 1)
        

        const n_0_54_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_54_STATE, 0)
            n_mul_setRight(n_0_54_STATE, 1000)
        

            const n_0_55_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_55_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_55_STATE, m)
                }
                n_0_55_STATE.messageSender = n_0_55_SNDS_0
                n_control_setReceiveBusName(n_0_55_STATE, "empty")
            })
        

            const n_0_76_STATE = {
                busName: "totalSampleLength_n8",
            }
        


        const n_0_120_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_120_STATE.outTemplates[0] = []
            
                n_0_120_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_120_STATE.outMessages[0] = msg_create(n_0_120_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_120_STATE.outMessages[0], 0, 7)
            
        
        
        n_0_120_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_120_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_91_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_91_STATE.outTemplates[0] = []
            
                n_0_91_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_91_STATE.outTemplates[0].push(4)
            

                n_0_91_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_91_STATE.outTemplates[0].push(7)
            

                n_0_91_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_91_STATE.outTemplates[0].push(5)
            

                n_0_91_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_91_STATE.outTemplates[0].push(2)
            
            n_0_91_STATE.outMessages[0] = msg_create(n_0_91_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_91_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_91_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_91_STATE.outMessages[0], 2, "9.wav")
            

                msg_writeStringToken(n_0_91_STATE.outMessages[0], 3, "n9")
            
        
        
        n_0_91_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_91_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_56_STATE = {
            operations: new Map(),
        }
    

        const n_0_57_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_57_STATE, 0)
            n_div_setRight(n_0_57_STATE, 1)
        

        const n_0_58_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_58_STATE, 0)
            n_mul_setRight(n_0_58_STATE, 1000)
        

            const n_0_59_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_59_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_59_STATE, m)
                }
                n_0_59_STATE.messageSender = n_0_59_SNDS_0
                n_control_setReceiveBusName(n_0_59_STATE, "empty")
            })
        

            const n_0_75_STATE = {
                busName: "totalSampleLength_n9",
            }
        


        const n_0_129_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_129_STATE.outTemplates[0] = []
            
                n_0_129_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_129_STATE.outMessages[0] = msg_create(n_0_129_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_129_STATE.outMessages[0], 0, 8)
            
        
        
        n_0_129_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_129_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_92_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_92_STATE.outTemplates[0] = []
            
                n_0_92_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_92_STATE.outTemplates[0].push(4)
            

                n_0_92_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_92_STATE.outTemplates[0].push(7)
            

                n_0_92_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_92_STATE.outTemplates[0].push(6)
            

                n_0_92_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_92_STATE.outTemplates[0].push(3)
            
            n_0_92_STATE.outMessages[0] = msg_create(n_0_92_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_92_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_92_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_92_STATE.outMessages[0], 2, "10.wav")
            

                msg_writeStringToken(n_0_92_STATE.outMessages[0], 3, "n10")
            
        
        
        n_0_92_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_92_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_60_STATE = {
            operations: new Map(),
        }
    

        const n_0_61_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_61_STATE, 0)
            n_div_setRight(n_0_61_STATE, 1)
        

        const n_0_62_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_62_STATE, 0)
            n_mul_setRight(n_0_62_STATE, 1000)
        

            const n_0_63_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_63_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_63_STATE, m)
                }
                n_0_63_STATE.messageSender = n_0_63_SNDS_0
                n_control_setReceiveBusName(n_0_63_STATE, "empty")
            })
        

            const n_0_74_STATE = {
                busName: "totalSampleLength_n10",
            }
        


        const n_0_130_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_130_STATE.outTemplates[0] = []
            
                n_0_130_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_130_STATE.outMessages[0] = msg_create(n_0_130_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_130_STATE.outMessages[0], 0, 9)
            
        
        
        n_0_130_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_130_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_93_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_93_STATE.outTemplates[0] = []
            
                n_0_93_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_93_STATE.outTemplates[0].push(4)
            

                n_0_93_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_93_STATE.outTemplates[0].push(7)
            

                n_0_93_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_93_STATE.outTemplates[0].push(6)
            

                n_0_93_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_93_STATE.outTemplates[0].push(3)
            
            n_0_93_STATE.outMessages[0] = msg_create(n_0_93_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_93_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_93_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_93_STATE.outMessages[0], 2, "11.wav")
            

                msg_writeStringToken(n_0_93_STATE.outMessages[0], 3, "n11")
            
        
        
        n_0_93_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_93_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_64_STATE = {
            operations: new Map(),
        }
    

        const n_0_65_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_65_STATE, 0)
            n_div_setRight(n_0_65_STATE, 1)
        

        const n_0_66_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_66_STATE, 0)
            n_mul_setRight(n_0_66_STATE, 1000)
        

            const n_0_67_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_67_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_67_STATE, m)
                }
                n_0_67_STATE.messageSender = n_0_67_SNDS_0
                n_control_setReceiveBusName(n_0_67_STATE, "empty")
            })
        

            const n_0_73_STATE = {
                busName: "totalSampleLength_n11",
            }
        


        const n_0_131_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_131_STATE.outTemplates[0] = []
            
                n_0_131_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_131_STATE.outMessages[0] = msg_create(n_0_131_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_131_STATE.outMessages[0], 0, 10)
            
        
        
        n_0_131_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_131_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_94_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_94_STATE.outTemplates[0] = []
            
                n_0_94_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_94_STATE.outTemplates[0].push(4)
            

                n_0_94_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_94_STATE.outTemplates[0].push(7)
            

                n_0_94_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_94_STATE.outTemplates[0].push(6)
            

                n_0_94_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_0_94_STATE.outTemplates[0].push(3)
            
            n_0_94_STATE.outMessages[0] = msg_create(n_0_94_STATE.outTemplates[0])
            
                msg_writeStringToken(n_0_94_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_0_94_STATE.outMessages[0], 1, "-resize")
            

                msg_writeStringToken(n_0_94_STATE.outMessages[0], 2, "12.wav")
            

                msg_writeStringToken(n_0_94_STATE.outMessages[0], 3, "n12")
            
        
        
        n_0_94_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_94_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_68_STATE = {
            operations: new Map(),
        }
    

        const n_0_69_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_69_STATE, 0)
            n_div_setRight(n_0_69_STATE, 1)
        

        const n_0_70_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_0_70_STATE, 0)
            n_mul_setRight(n_0_70_STATE, 1000)
        

            const n_0_71_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_71_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_71_STATE, m)
                }
                n_0_71_STATE.messageSender = n_0_71_SNDS_0
                n_control_setReceiveBusName(n_0_71_STATE, "empty")
            })
        

            const n_0_72_STATE = {
                busName: "totalSampleLength_n12",
            }
        


        const n_0_132_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_132_STATE.outTemplates[0] = []
            
                n_0_132_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_132_STATE.outMessages[0] = msg_create(n_0_132_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_132_STATE.outMessages[0], 0, 11)
            
        
        
        n_0_132_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_132_STATE.outMessages[0]
                }
,
        ]
    


        const n_0_10_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_0_10_STATE, 0)
            n_div_setRight(n_0_10_STATE, 1000)
        

            const n_0_11_STATE = {
                busName: "msRate",
            }
        
commons_waitFrame(0, () => n_0_9_RCVS_0(msg_bang()))
commons_waitFrame(0, () => n_0_138_RCVS_0(msg_bang()))

        const n_0_138_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_138_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_0_138_STATE, 5)
        })
    

        const n_0_140_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_140_STATE.outTemplates[0] = []
            
                n_0_140_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_140_STATE.outMessages[0] = msg_create(n_0_140_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_140_STATE.outMessages[0], 0, 1)
            
        
        
        n_0_140_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_140_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_142_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_0_142_STATE, 0)
            n_add_setRight(n_0_142_STATE, 0)
        

            const n_0_141_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_141_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_141_STATE, m)
                }
                n_0_141_STATE.messageSender = n_0_141_SNDS_0
                n_control_setReceiveBusName(n_0_141_STATE, "empty")
            })
        

        const n_0_143_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_modlegacy_setLeft(n_0_143_STATE, 0)
            n_modlegacy_setRight(n_0_143_STATE, 12)
        

            const n_0_144_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_144_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_144_STATE, m)
                }
                n_0_144_STATE.messageSender = n_0_145_RCVS_0
                n_control_setReceiveBusName(n_0_144_STATE, "empty")
            })
        

            const n_0_145_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_0_145_STATE, 0)
        


        const n_28_10_STATE = {
            floatFilter: 0,
            stringFilter: "seed",
            filterType: MSG_STRING_TOKEN,
        }
    

        const n_28_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_28_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_28_11_STATE.outTemplates[0] = []
            
                n_28_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_28_11_STATE.outTemplates[0].push(4)
            

                n_28_11_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_28_11_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_28_11_STATE.outMessages[0] = msg_create(n_28_11_STATE.outTemplates[0])
            
                msg_writeStringToken(n_28_11_STATE.outMessages[0], 0, "seed")
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_28_11_STATE.outMessages[0], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_28_11_STATE.outMessages[0], 1, stringMem[0])
                }
            
        
                    return n_28_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_28_5_STATE = {
            maxValue: 12
        }
    


        const n_0_150_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_eq_setLeft(n_0_150_STATE, 0)
            n_eq_setRight(n_0_150_STATE, 0)
        

        const n_0_156_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_0_156_STATE, 0)
            n_add_setRight(n_0_156_STATE, 0)
        

        const n_0_176_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_0_176_STATE, 0)
            n_add_setRight(n_0_176_STATE, 0)
        

        const n_0_157_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_158_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_158_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_158_STATE, m)
            }
            n_0_158_STATE.messageSender = n_0_161_RCVS_0
            n_control_setReceiveBusName(n_0_158_STATE, "empty")
        })

        
    

            const n_0_161_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_0_161_STATE, 0)
        

            const n_0_162_STATE = {
                busName: "nuSong",
            }
        

        const n_0_159_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_159_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_159_STATE, m)
            }
            n_0_159_STATE.messageSender = n_0_160_RCVS_0
            n_control_setReceiveBusName(n_0_159_STATE, "empty")
        })

        
    

            const n_0_160_STATE = {
                busName: "getNewSong",
            }
        

            const n_0_178_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_178_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_178_STATE, m)
                }
                n_0_178_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_0_178_STATE, "empty")
            })
        

        const n_0_153_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_eq_setLeft(n_0_153_STATE, 0)
            n_eq_setRight(n_0_153_STATE, 0)
        

        const n_0_165_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_eq_setLeft(n_0_165_STATE, 0)
            n_eq_setRight(n_0_165_STATE, 0)
        

        const n_0_173_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_0_173_STATE, 0)
            n_add_setRight(n_0_173_STATE, 0)
        

            const n_0_177_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_0_177_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_0_177_STATE, m)
                }
                n_0_177_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_0_177_STATE, "empty")
            })
        

        const n_0_169_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_eq_setLeft(n_0_169_STATE, 0)
            n_eq_setRight(n_0_169_STATE, 0)
        


        const n_0_175_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_sub_setLeft(n_0_175_STATE, 0)
            n_sub_setRight(n_0_175_STATE, 4)
        

        const n_0_174_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_sub_setLeft(n_0_174_STATE, 0)
            n_sub_setRight(n_0_174_STATE, 3)
        

        const n_0_166_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_sub_setLeft(n_0_166_STATE, 0)
            n_sub_setRight(n_0_166_STATE, 2)
        

        const n_0_172_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_sub_setLeft(n_0_172_STATE, 0)
            n_sub_setRight(n_0_172_STATE, 1)
        

        const n_0_135_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_135_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_135_STATE, m)
            }
            n_0_135_STATE.messageSender = n_0_140_RCVS_0
            n_control_setReceiveBusName(n_0_135_STATE, "empty")
        })

        
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("songSelectaBang", n_27_17_RCVS_0)
            })
        

        const n_27_17_STATE = {
            maxValue: 20
        }
    

            const n_27_1_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_27_1_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_27_1_STATE, m)
                }
                n_27_1_STATE.messageSender = n_27_7_RCVS_0
                n_control_setReceiveBusName(n_27_1_STATE, "empty")
            })
        

        const n_27_7_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_27_2_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_27_2_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_27_2_STATE, m)
            }
            n_27_2_STATE.messageSender = n_0_135_RCVS_0
            n_control_setReceiveBusName(n_27_2_STATE, "empty")
        })

        
    

        const n_27_16_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_27_16_STATE.outTemplates[0] = []
            
                n_27_16_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_27_16_STATE.outMessages[0] = msg_create(n_27_16_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_27_16_STATE.outMessages[0], 0, 0)
            
        
        
        n_27_16_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_27_16_STATE.outMessages[0]
                }
,
        ]
    

        const n_27_15_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_27_15_STATE, 0)
            n_add_setRight(n_27_15_STATE, 0)
        

            const n_27_12_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_27_12_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_27_12_STATE, m)
                }
                n_27_12_STATE.messageSender = n_27_12_SNDS_0
                n_control_setReceiveBusName(n_27_12_STATE, "empty")
            })
        

        const n_27_18_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_modlegacy_setLeft(n_27_18_STATE, 0)
            n_modlegacy_setRight(n_27_18_STATE, 70)
        

            const n_27_13_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_27_13_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_27_13_STATE, m)
                }
                n_27_13_STATE.messageSender = n_27_14_RCVS_0
                n_control_setReceiveBusName(n_27_13_STATE, "empty")
            })
        

        const n_27_14_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_27_9_STATE = {
            maxValue: 5
        }
    

        const n_27_10_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_27_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_27_6_STATE.outTemplates[0] = []
            
                n_27_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_27_6_STATE.outMessages[0] = msg_create(n_27_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_27_6_STATE.outMessages[0], 0, 5)
            
        
        
        n_27_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_27_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_27_3_STATE = {
            continueIter: true,
        }
    

        const n_27_8_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_27_8_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_27_8_STATE, 210000)
        })
    

        const n_27_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_27_11_STATE.outTemplates[0] = []
            
                n_27_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_27_11_STATE.outMessages[0] = msg_create(n_27_11_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_27_11_STATE.outMessages[0], 0, 1)
            
        
        
        n_27_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_27_11_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("getNewSong", n_0_145_RCVS_0)
            })
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("nuSong", SND_TO_NULL)
            })
        

            const n_0_152_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_0_152_STATE, 0)
        

            const n_0_155_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_0_155_STATE, 0)
        

            const n_0_168_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_0_168_STATE, 0)
        

            const n_0_171_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_0_171_STATE, 0)
        

        const n_27_5_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_27_5_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_27_5_STATE, m)
            }
            n_27_5_STATE.messageSender = n_27_17_RCVS_0
            n_control_setReceiveBusName(n_27_5_STATE, "empty")
        })

        
    
commons_waitFrame(0, () => n_28_1_RCVS_0(msg_bang()))


        const n_28_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_28_4_STATE.outTemplates[0] = []
            
                n_28_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_28_4_STATE.outTemplates[0].push(5)
            
            n_28_4_STATE.outMessages[0] = msg_create(n_28_4_STATE.outTemplates[0])
            
                msg_writeStringToken(n_28_4_STATE.outMessages[0], 0, "Seed:")
            
        
        
        n_28_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_28_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_28_17_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_28_17_STATE.outTemplates[0] = []
            
                n_28_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_28_17_STATE.outTemplates[0].push(4)
            

                n_28_17_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                n_28_17_STATE.outTemplates[0].push(10)
            
            n_28_17_STATE.outMessages[0] = msg_create(n_28_17_STATE.outTemplates[0])
            
                msg_writeStringToken(n_28_17_STATE.outMessages[0], 0, "read")
            

                msg_writeStringToken(n_28_17_STATE.outMessages[0], 1, "random2.pd")
            
        
        
        n_28_17_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_28_17_STATE.outMessages[0]
                }
,
        ]
    

            const n_28_20_STATE = {
                busName: "28-random2",
            }
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("28-seed", n_28_11_RCVS_0)
            })
        

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_1":{"portletIds":["0"],"metadata":{"group":"control:float","type":"tgl","label":"","position":[209,47],"initValue":0,"minValue":0,"maxValue":1}},"n_0_2":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[209,89]}},"n_0_6":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[68,178]}},"n_0_14":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[199,366]}},"n_0_31":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[377,366]}},"n_0_35":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[555,366]}},"n_0_39":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[733,366]}},"n_0_43":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[911,366]}},"n_0_47":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[1089,366]}},"n_0_51":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[1267,366]}},"n_0_55":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[1445,366]}},"n_0_59":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[1623,366]}},"n_0_63":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[1801,366]}},"n_0_67":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[1979,366]}},"n_0_71":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"","position":[2157,366]}},"n_0_83":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[199,258]}},"n_0_84":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[377,258]}},"n_0_85":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[555,258]}},"n_0_86":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[733,258]}},"n_0_87":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[911,258]}},"n_0_88":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1089,258]}},"n_0_89":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1267,258]}},"n_0_90":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1445,258]}},"n_0_91":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1623,258]}},"n_0_92":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1801,258]}},"n_0_93":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1979,258]}},"n_0_94":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[2157,258]}},"n_0_99":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[250,451]}},"n_0_102":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[428,451]}},"n_0_107":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[606,451]}},"n_0_108":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[784,451]}},"n_0_117":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[962,451]}},"n_0_118":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1140,451]}},"n_0_119":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1318,451]}},"n_0_120":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1496,451]}},"n_0_129":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1674,451]}},"n_0_130":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1852,451]}},"n_0_131":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[2030,451]}},"n_0_132":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[2208,451]}},"n_0_135":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[70,665]}},"n_0_140":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[70,744]}},"n_0_141":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"empty","position":[70,801]}},"n_0_144":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"empty","position":[70,858]}},"n_0_158":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[70,1288]}},"n_0_159":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[102,1288]}},"n_0_177":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"empty","position":[418,1241]}},"n_0_178":{"portletIds":["0"],"metadata":{"group":"control:float","type":"floatatom","label":"empty","position":[198,1264]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_1":{"0":"ioRcv_n_0_1_0"},"n_0_2":{"0":"ioRcv_n_0_2_0"},"n_0_6":{"0":"ioRcv_n_0_6_0"},"n_0_14":{"0":"ioRcv_n_0_14_0"},"n_0_31":{"0":"ioRcv_n_0_31_0"},"n_0_35":{"0":"ioRcv_n_0_35_0"},"n_0_39":{"0":"ioRcv_n_0_39_0"},"n_0_43":{"0":"ioRcv_n_0_43_0"},"n_0_47":{"0":"ioRcv_n_0_47_0"},"n_0_51":{"0":"ioRcv_n_0_51_0"},"n_0_55":{"0":"ioRcv_n_0_55_0"},"n_0_59":{"0":"ioRcv_n_0_59_0"},"n_0_63":{"0":"ioRcv_n_0_63_0"},"n_0_67":{"0":"ioRcv_n_0_67_0"},"n_0_71":{"0":"ioRcv_n_0_71_0"},"n_0_83":{"0":"ioRcv_n_0_83_0"},"n_0_84":{"0":"ioRcv_n_0_84_0"},"n_0_85":{"0":"ioRcv_n_0_85_0"},"n_0_86":{"0":"ioRcv_n_0_86_0"},"n_0_87":{"0":"ioRcv_n_0_87_0"},"n_0_88":{"0":"ioRcv_n_0_88_0"},"n_0_89":{"0":"ioRcv_n_0_89_0"},"n_0_90":{"0":"ioRcv_n_0_90_0"},"n_0_91":{"0":"ioRcv_n_0_91_0"},"n_0_92":{"0":"ioRcv_n_0_92_0"},"n_0_93":{"0":"ioRcv_n_0_93_0"},"n_0_94":{"0":"ioRcv_n_0_94_0"},"n_0_99":{"0":"ioRcv_n_0_99_0"},"n_0_102":{"0":"ioRcv_n_0_102_0"},"n_0_107":{"0":"ioRcv_n_0_107_0"},"n_0_108":{"0":"ioRcv_n_0_108_0"},"n_0_117":{"0":"ioRcv_n_0_117_0"},"n_0_118":{"0":"ioRcv_n_0_118_0"},"n_0_119":{"0":"ioRcv_n_0_119_0"},"n_0_120":{"0":"ioRcv_n_0_120_0"},"n_0_129":{"0":"ioRcv_n_0_129_0"},"n_0_130":{"0":"ioRcv_n_0_130_0"},"n_0_131":{"0":"ioRcv_n_0_131_0"},"n_0_132":{"0":"ioRcv_n_0_132_0"},"n_0_135":{"0":"ioRcv_n_0_135_0"},"n_0_140":{"0":"ioRcv_n_0_140_0"},"n_0_141":{"0":"ioRcv_n_0_141_0"},"n_0_144":{"0":"ioRcv_n_0_144_0"},"n_0_158":{"0":"ioRcv_n_0_158_0"},"n_0_159":{"0":"ioRcv_n_0_159_0"},"n_0_177":{"0":"ioRcv_n_0_177_0"},"n_0_178":{"0":"ioRcv_n_0_178_0"}},"messageSenders":{}}}}},
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
                    n_0_1: {
                            "0": ioRcv_n_0_1_0,
                        },
n_0_2: {
                            "0": ioRcv_n_0_2_0,
                        },
n_0_6: {
                            "0": ioRcv_n_0_6_0,
                        },
n_0_14: {
                            "0": ioRcv_n_0_14_0,
                        },
n_0_31: {
                            "0": ioRcv_n_0_31_0,
                        },
n_0_35: {
                            "0": ioRcv_n_0_35_0,
                        },
n_0_39: {
                            "0": ioRcv_n_0_39_0,
                        },
n_0_43: {
                            "0": ioRcv_n_0_43_0,
                        },
n_0_47: {
                            "0": ioRcv_n_0_47_0,
                        },
n_0_51: {
                            "0": ioRcv_n_0_51_0,
                        },
n_0_55: {
                            "0": ioRcv_n_0_55_0,
                        },
n_0_59: {
                            "0": ioRcv_n_0_59_0,
                        },
n_0_63: {
                            "0": ioRcv_n_0_63_0,
                        },
n_0_67: {
                            "0": ioRcv_n_0_67_0,
                        },
n_0_71: {
                            "0": ioRcv_n_0_71_0,
                        },
n_0_83: {
                            "0": ioRcv_n_0_83_0,
                        },
n_0_84: {
                            "0": ioRcv_n_0_84_0,
                        },
n_0_85: {
                            "0": ioRcv_n_0_85_0,
                        },
n_0_86: {
                            "0": ioRcv_n_0_86_0,
                        },
n_0_87: {
                            "0": ioRcv_n_0_87_0,
                        },
n_0_88: {
                            "0": ioRcv_n_0_88_0,
                        },
n_0_89: {
                            "0": ioRcv_n_0_89_0,
                        },
n_0_90: {
                            "0": ioRcv_n_0_90_0,
                        },
n_0_91: {
                            "0": ioRcv_n_0_91_0,
                        },
n_0_92: {
                            "0": ioRcv_n_0_92_0,
                        },
n_0_93: {
                            "0": ioRcv_n_0_93_0,
                        },
n_0_94: {
                            "0": ioRcv_n_0_94_0,
                        },
n_0_99: {
                            "0": ioRcv_n_0_99_0,
                        },
n_0_102: {
                            "0": ioRcv_n_0_102_0,
                        },
n_0_107: {
                            "0": ioRcv_n_0_107_0,
                        },
n_0_108: {
                            "0": ioRcv_n_0_108_0,
                        },
n_0_117: {
                            "0": ioRcv_n_0_117_0,
                        },
n_0_118: {
                            "0": ioRcv_n_0_118_0,
                        },
n_0_119: {
                            "0": ioRcv_n_0_119_0,
                        },
n_0_120: {
                            "0": ioRcv_n_0_120_0,
                        },
n_0_129: {
                            "0": ioRcv_n_0_129_0,
                        },
n_0_130: {
                            "0": ioRcv_n_0_130_0,
                        },
n_0_131: {
                            "0": ioRcv_n_0_131_0,
                        },
n_0_132: {
                            "0": ioRcv_n_0_132_0,
                        },
n_0_135: {
                            "0": ioRcv_n_0_135_0,
                        },
n_0_140: {
                            "0": ioRcv_n_0_140_0,
                        },
n_0_141: {
                            "0": ioRcv_n_0_141_0,
                        },
n_0_144: {
                            "0": ioRcv_n_0_144_0,
                        },
n_0_158: {
                            "0": ioRcv_n_0_158_0,
                        },
n_0_159: {
                            "0": ioRcv_n_0_159_0,
                        },
n_0_177: {
                            "0": ioRcv_n_0_177_0,
                        },
n_0_178: {
                            "0": ioRcv_n_0_178_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        
                exports.i_fs_readSoundFile = () => { throw new Error('import for i_fs_readSoundFile not provided') }
                const i_fs_readSoundFile = (...args) => exports.i_fs_readSoundFile(...args)
            

                exports.i_fs_writeSoundFile = () => { throw new Error('import for i_fs_writeSoundFile not provided') }
                const i_fs_writeSoundFile = (...args) => exports.i_fs_writeSoundFile(...args)
            
exports.commons_getArray = commons_getArray
exports.commons_setArray = commons_setArray
exports.x_fs_onReadSoundFileResponse = x_fs_onReadSoundFileResponse
exports.x_fs_onWriteSoundFileResponse = x_fs_onWriteSoundFileResponse
    