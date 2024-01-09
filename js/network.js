
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
function n_add_setLeft(state, value) {
                    state.leftOp = value
                }
function n_add_setRight(state, value) {
                    state.rightOp = value
                }


function interpolateLin(x, p0, p1) {
            return p0.y + (x - p0.x) * (p1.y - p0.y) / (p1.x - p0.x)
        }

function computeSlope(p0, p1) {
            return p1.x !== p0.x ? (p1.y - p0.y) / (p1.x - p0.x) : 0
        }
function removePointsBeforeFrame(points, frame) {
            const newPoints = []
            let i = 0
            while (i < points.length) {
                if (frame <= points[i].x) {
                    newPoints.push(points[i])
                }
                i++
            }
            return newPoints
        }
function insertNewLinePoints(points, p0, p1) {
            const newPoints = []
            let i = 0
            
            // Keep the points that are before the new points added
            while (i < points.length && points[i].x <= p0.x) {
                newPoints.push(points[i])
                i++
            }
            
            // Find the start value of the start point :
            
            // 1. If there is a previous point and that previous point
            // is on the same frame, we don't modify the start point value.
            // (represents a vertical line).
            if (0 < i - 1 && points[i - 1].x === p0.x) {

            // 2. If new points are inserted in between already existing points 
            // we need to interpolate the existing line to find the startValue.
            } else if (0 < i && i < points.length) {
                newPoints.push({
                    x: p0.x,
                    y: interpolateLin(p0.x, points[i - 1], points[i])
                })

            // 3. If new line is inserted after all existing points, 
            // we just take the value of the last point
            } else if (i >= points.length && points.length) {
                newPoints.push({
                    x: p0.x,
                    y: points[points.length - 1].y,
                })

            // 4. If new line placed in first position, we take the defaultStartValue.
            } else if (i === 0) {
                newPoints.push({
                    x: p0.x,
                    y: p0.y,
                })
            }
            
            newPoints.push({
                x: p1.x,
                y: p1.y,
            })
            return newPoints
        }
function computeFrameAjustedPoints(points) {
            if (points.length < 2) {
                throw new Error('invalid length for points')
            }

            const newPoints = []
            let i = 0
            let p = points[0]
            let frameLower = 0
            let frameUpper = 0
            
            while(i < points.length) {
                p = points[i]
                frameLower = Math.floor(p.x)
                frameUpper = frameLower + 1

                // I. Placing interpolated point at the lower bound of the current frame
                // ------------------------------------------------------------------------
                // 1. Point is already on an exact frame,
                if (p.x === frameLower) {
                    newPoints.push({ x: p.x, y: p.y })

                    // 1.a. if several of the next points are also on the same X,
                    // we find the last one to draw a vertical line.
                    while (
                        (i + 1) < points.length
                        && points[i + 1].x === frameLower
                    ) {
                        i++
                    }
                    if (points[i].y !== newPoints[newPoints.length - 1].y) {
                        newPoints.push({ x: points[i].x, y: points[i].y })
                    }

                    // 1.b. if last point, we quit
                    if (i + 1 >= points.length) {
                        break
                    }

                    // 1.c. if next point is in a different frame we can move on to next iteration
                    if (frameUpper <= points[i + 1].x) {
                        i++
                        continue
                    }
                
                // 2. Point isn't on an exact frame
                // 2.a. There's a previous point, the we use it to interpolate the value.
                } else if (newPoints.length) {
                    newPoints.push({
                        x: frameLower,
                        y: interpolateLin(frameLower, points[i - 1], p),
                    })
                
                // 2.b. It's the very first point, then we don't change its value.
                } else {
                    newPoints.push({ x: frameLower, y: p.y })
                }

                // II. Placing interpolated point at the upper bound of the current frame
                // ---------------------------------------------------------------------------
                // First, we find the closest point from the frame upper bound (could be the same p).
                // Or could be a point that is exactly placed on frameUpper.
                while (
                    (i + 1) < points.length 
                    && (
                        Math.ceil(points[i + 1].x) === frameUpper
                        || Math.floor(points[i + 1].x) === frameUpper
                    )
                ) {
                    i++
                }
                p = points[i]

                // 1. If the next point is directly in the next frame, 
                // we do nothing, as this corresponds with next iteration frameLower.
                if (Math.floor(p.x) === frameUpper) {
                    continue
                
                // 2. If there's still a point after p, we use it to interpolate the value
                } else if (i < points.length - 1) {
                    newPoints.push({
                        x: frameUpper,
                        y: interpolateLin(frameUpper, p, points[i + 1]),
                    })

                // 3. If it's the last point, we dont change the value
                } else {
                    newPoints.push({ x: frameUpper, y: p.y })
                }

                i++
            }

            return newPoints
        }
function computeLineSegments(points) {
            const lineSegments = []
            let i = 0
            let p0
            let p1

            while(i < points.length - 1) {
                p0 = points[i]
                p1 = points[i + 1]
                lineSegments.push({
                    p0, p1, 
                    dy: computeSlope(p0, p1),
                    dx: 1,
                })
                i++
            }
            return lineSegments
        }

const n_line_t_defaultLine = {
        p0: {x: -1, y: 0},
        p1: {x: -1, y: 0},
        dx: 1,
        dy: 0,
    }
function n_line_t_setNewLine(state, targetValue) {
        const startFrame = toFloat(FRAME)
        const endFrame = toFloat(FRAME) + state.nextDurationSamp
        if (endFrame === toFloat(FRAME)) {
            state.currentLine = n_line_t_defaultLine
            state.currentValue = targetValue
            state.nextDurationSamp = 0
        } else {
            state.currentLine = {
                p0: {
                    x: startFrame, 
                    y: state.currentValue,
                }, 
                p1: {
                    x: endFrame, 
                    y: targetValue,
                }, 
                dx: 1,
                dy: 0,
            }
            state.currentLine.dy = computeSlope(state.currentLine.p0, state.currentLine.p1)
            state.nextDurationSamp = 0
        }
    }
function n_line_t_setNextDuration(state, durationMsec) {
        state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
    }
function n_line_t_stop(state) {
        state.currentLine.p1.x = -1
        state.currentLine.p1.y = state.currentValue
    }

function n_osc_t_setPhase(state, phase) {
            state.phase = phase % 1.0 * 2 * Math.PI
        }
const SIGNAL_BUSES = new Map()
SIGNAL_BUSES.set('', 0)
function addAssignSignalBus(busName, value) {
            const newValue = SIGNAL_BUSES.get(busName) + value
            SIGNAL_BUSES.set(
                busName,
                newValue,
            )
            return newValue
        }
function setSignalBus(busName, value) {
            SIGNAL_BUSES.set(
                busName,
                value,
            )
        }
function resetSignalBus(busName) {
            SIGNAL_BUSES.set(busName, 0)
        }
function readSignalBus(busName) {
            return SIGNAL_BUSES.get(busName)
        }

function n_throw_catch_send_receive_t_setBusName(state, busName) {
        if (busName.length) {
            state.busName = busName
            resetSignalBus(state.busName)
        }
    }


function n_phasor_t_setPhase(state, phase) {
            state.phase = phase % 1.0
        }

        


function n_2_2_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_2_2_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_2_2_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_2_2_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_2_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_2_3_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_2_3_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_2_3_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_3_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            SND_TO_NULL(msg_floats([n_2_3_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_2_3", inlet "0_message", unsupported message : ' + msg_display(m))
                            }



function n_4_2_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_4_2_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_4_2_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_4_2_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_4_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_4_3_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_4_3_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_4_3_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_3_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            SND_TO_NULL(msg_floats([n_4_3_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_4_3", inlet "0_message", unsupported message : ' + msg_display(m))
                            }



function n_6_2_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_6_2_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_6_2_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_6_2_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_6_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_6_3_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_6_3_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_6_3_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_3_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            SND_TO_NULL(msg_floats([n_6_3_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_6_3", inlet "0_message", unsupported message : ' + msg_display(m))
                            }



function n_8_2_RCVS_0(m) {
                                
        if (msg_getLength(m) === 1) {
            if (
                (msg_isFloatToken(m, 0) && msg_readFloatToken(m, 0) === 0)
                || msg_isAction(m, 'stop')
            ) {
                n_metro_stop(n_8_2_STATE)
                return

            } else if (
                msg_isFloatToken(m, 0)
                || msg_isBang(m)
            ) {
                n_8_2_STATE.realNextTick = toFloat(FRAME)
                n_metro_scheduleNextTick(n_8_2_STATE)
                return
            }
        }
    
                                throw new Error('[metro], id "n_8_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_8_3_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_8_3_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_8_3_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_8_3_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            SND_TO_NULL(msg_floats([n_8_3_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_8_3", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_13_0_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_0_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_34_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_13_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_13_34_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_13_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_1_RCVS_0(m) {
                                
                if (n_13_1_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_13_1_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_13_1_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_13_1_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_13_1_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_13_2_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_13_1_STATE.stringFilter
                    ) {
                        n_13_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_13_1_STATE.floatFilter
                ) {
                    n_13_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_13_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_0_RCVS_0(m) {
                                
            msgBusPublish(n_9_0_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_9_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_4_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_4_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_35_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_13_5_RCVS_0(msg_floats([Math.floor(Math.random() * n_13_35_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_13_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_5_RCVS_0(m) {
                                
                if (n_13_5_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_13_5_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_13_5_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_13_5_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_13_5_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_13_6_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_13_5_STATE.stringFilter
                    ) {
                        n_13_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_13_5_STATE.floatFilter
                ) {
                    n_13_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_13_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_6_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_6_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_1_RCVS_0(m) {
                                
            msgBusPublish(n_9_1_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_9_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_7_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_7_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_36_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_13_36_SNDS_0(msg_floats([Math.floor(Math.random() * n_13_36_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_13_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_8_RCVS_0(m) {
                                
                if (n_13_8_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_13_8_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_13_8_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_13_8_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_13_8_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_13_9_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_13_8_STATE.stringFilter
                    ) {
                        n_13_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_13_8_STATE.floatFilter
                ) {
                    n_13_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_13_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_9_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_9_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_2_RCVS_0(m) {
                                
            msgBusPublish(n_9_2_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_9_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_10_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_13_10_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_13_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_11_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_11_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_37_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_13_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_13_37_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_13_37", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_12_RCVS_0(m) {
                                
                if (n_13_12_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_13_12_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_13_12_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_13_12_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_13_12_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_13_13_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_13_12_STATE.stringFilter
                    ) {
                        n_13_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_13_12_STATE.floatFilter
                ) {
                    n_13_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_13_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_13_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_13_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_3_RCVS_0(m) {
                                
            msgBusPublish(n_9_3_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_9_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_16_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_16_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_33_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_13_17_RCVS_0(msg_floats([Math.floor(Math.random() * n_13_33_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_13_33", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_17_RCVS_0(m) {
                                
                if (n_13_17_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_13_17_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_13_17_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_13_17_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_13_17_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_13_18_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_13_17_STATE.stringFilter
                    ) {
                        n_13_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_13_17_STATE.floatFilter
                ) {
                    n_13_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_13_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_18_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_18_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_5_RCVS_0(m) {
                                
            msgBusPublish(n_9_5_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_9_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_19_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_13_19_STATE, m)
            return
        
                                throw new Error('[bang], id "n_13_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_38_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_13_20_RCVS_0(msg_floats([Math.floor(Math.random() * n_13_38_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_13_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_20_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_13_21_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_13_22_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_13_23_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_13_24_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_13_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_21_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_21_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_21_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_21_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_21_STATE.outTemplates[0])
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
                n_13_21_STATE.outMessages[0] = message
                n_13_21_STATE.messageTransferFunctions.splice(0, n_13_21_STATE.messageTransferFunctions.length - 1)
                n_13_21_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_21_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_21_STATE.messageTransferFunctions.length; i++) {
                    n_9_6_RCVS_0(n_13_21_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_9_6_RCVS_0(m) {
                                
            msgBusPublish(n_9_6_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_9_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_22_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_22_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_22_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_22_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_22_STATE.outTemplates[0])
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
                n_13_22_STATE.outMessages[0] = message
                n_13_22_STATE.messageTransferFunctions.splice(0, n_13_22_STATE.messageTransferFunctions.length - 1)
                n_13_22_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_22_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_22_STATE.messageTransferFunctions.length; i++) {
                    n_9_6_RCVS_0(n_13_22_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_23_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_23_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_23_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_23_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_23_STATE.outTemplates[0])
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
                n_13_23_STATE.outMessages[0] = message
                n_13_23_STATE.messageTransferFunctions.splice(0, n_13_23_STATE.messageTransferFunctions.length - 1)
                n_13_23_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_23_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_23_STATE.messageTransferFunctions.length; i++) {
                    n_9_6_RCVS_0(n_13_23_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_13_24_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_24_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_24_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_24_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_24_STATE.outTemplates[0])
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
                n_13_24_STATE.outMessages[0] = message
                n_13_24_STATE.messageTransferFunctions.splice(0, n_13_24_STATE.messageTransferFunctions.length - 1)
                n_13_24_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_24_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_24_STATE.messageTransferFunctions.length; i++) {
                    n_9_6_RCVS_0(n_13_24_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_24", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_13_27_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_27_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_27_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_27_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_27_STATE.outTemplates[0])
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
                n_13_27_STATE.outMessages[0] = message
                n_13_27_STATE.messageTransferFunctions.splice(0, n_13_27_STATE.messageTransferFunctions.length - 1)
                n_13_27_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_27_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_27_STATE.messageTransferFunctions.length; i++) {
                    n_14_17_RCVS_1(n_13_27_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_27", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_14_17_OUTS_0 = 0
function n_14_17_RCVS_1(m) {
                                
                            n_14_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_14_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_13_28_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_28_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_28_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_28_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_28_STATE.outTemplates[0])
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
                n_13_28_STATE.outMessages[0] = message
                n_13_28_STATE.messageTransferFunctions.splice(0, n_13_28_STATE.messageTransferFunctions.length - 1)
                n_13_28_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_28_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_28_STATE.messageTransferFunctions.length; i++) {
                    n_16_17_RCVS_1(n_13_28_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_28", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_16_17_OUTS_0 = 0
function n_16_17_RCVS_1(m) {
                                
                            n_16_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_16_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_13_29_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_29_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_29_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_29_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_29_STATE.outTemplates[0])
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
                n_13_29_STATE.outMessages[0] = message
                n_13_29_STATE.messageTransferFunctions.splice(0, n_13_29_STATE.messageTransferFunctions.length - 1)
                n_13_29_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_29_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_29_STATE.messageTransferFunctions.length; i++) {
                    n_18_17_RCVS_1(n_13_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_18_17_OUTS_0 = 0
function n_18_17_RCVS_1(m) {
                                
                            n_18_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_18_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_13_30_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_30_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_30_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_30_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_30_STATE.outTemplates[0])
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
                n_13_30_STATE.outMessages[0] = message
                n_13_30_STATE.messageTransferFunctions.splice(0, n_13_30_STATE.messageTransferFunctions.length - 1)
                n_13_30_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_30_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_30_STATE.messageTransferFunctions.length; i++) {
                    n_20_17_RCVS_1(n_13_30_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_30", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_20_17_OUTS_0 = 0
function n_20_17_RCVS_1(m) {
                                
                            n_20_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_20_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_13_31_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_31_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_31_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_31_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_31_STATE.outTemplates[0])
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
                n_13_31_STATE.outMessages[0] = message
                n_13_31_STATE.messageTransferFunctions.splice(0, n_13_31_STATE.messageTransferFunctions.length - 1)
                n_13_31_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_31_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_31_STATE.messageTransferFunctions.length; i++) {
                    n_22_17_RCVS_1(n_13_31_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_31", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_22_17_OUTS_0 = 0
function n_22_17_RCVS_1(m) {
                                
                            n_22_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_22_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_13_32_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_13_32_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_13_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_13_32_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_13_32_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_13_32_STATE.outTemplates[0])
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
                n_13_32_STATE.outMessages[0] = message
                n_13_32_STATE.messageTransferFunctions.splice(0, n_13_32_STATE.messageTransferFunctions.length - 1)
                n_13_32_STATE.messageTransferFunctions[0] = function (m) {
                    return n_13_32_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_13_32_STATE.messageTransferFunctions.length; i++) {
                    n_24_17_RCVS_1(n_13_32_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_13_32", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_24_17_OUTS_0 = 0
function n_24_17_RCVS_1(m) {
                                
                            n_24_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_24_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_14_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_14_7_STATE, msg_readFloatToken(m, 0))
                n_14_2_RCVS_1(msg_floats([n_14_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_14_2_RCVS_1(msg_floats([n_14_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_14_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_2_RCVS_0(m) {
                                
        if (!n_14_2_STATE.isClosed) {
            m_n_14_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_14_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_14_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_14_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_14_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_14_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_14_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_14_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_14_8_RCVS_0(msg_floats([n_14_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_14_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_14_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_14_8_STATE.currentValue) {
                    n_14_8_STATE.currentValue = newValue
                    n_14_11_RCVS_0(msg_floats([n_14_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_14_11_RCVS_0(msg_floats([n_14_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_14_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_14_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_11_RCVS_0(m) {
                                
        n_15_0_RCVS_0(msg_bang())
n_14_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_14_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_10_RCVS_0(m) {
                                
        if (!n_14_10_STATE.isClosed) {
            n_14_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_14_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_14_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_14_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_14_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_14_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_14_13_STATE.currentValue) {
                    n_14_13_STATE.currentValue = newValue
                    n_14_9_RCVS_0(msg_floats([n_14_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_14_9_RCVS_0(msg_floats([n_14_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_14_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_14_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_9_RCVS_0(m) {
                                
                if (n_14_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_14_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_14_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_14_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_14_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_14_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_14_9_STATE.stringFilter
                    ) {
                        n_14_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_14_9_STATE.floatFilter
                ) {
                    n_14_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_14_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_3_RCVS_0(m) {
                                
        n_14_5_RCVS_0(msg_bang())
n_13_16_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_14_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_5_RCVS_0(m) {
                                
        n_14_4_RCVS_0(msg_bang())
n_14_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_14_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_14_14_STATE, 
                            () => n_14_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_14_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_14_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_14_14_STATE,
                        () => n_14_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_14_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_14_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_14_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_14_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_14_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_14_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_14_6_STATE.outTemplates[0])
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
                n_14_6_STATE.outMessages[0] = message
                n_14_6_STATE.messageTransferFunctions.splice(0, n_14_6_STATE.messageTransferFunctions.length - 1)
                n_14_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_14_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_14_6_STATE.messageTransferFunctions.length; i++) {
                    n_14_7_RCVS_0(n_14_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_14_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_14_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_14_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_14_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_14_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_14_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_14_4_STATE.outTemplates[0])
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
                n_14_4_STATE.outMessages[0] = message
                n_14_4_STATE.messageTransferFunctions.splice(0, n_14_4_STATE.messageTransferFunctions.length - 1)
                n_14_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_14_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_14_4_STATE.messageTransferFunctions.length; i++) {
                    n_14_7_RCVS_0(n_14_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_14_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_15_0_RCVS_0(m) {
                                
        n_15_6_RCVS_0(msg_bang())
n_15_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_15_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_15_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_15_2_STATE, 
                            () => n_15_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_15_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_15_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_15_2_STATE,
                        () => n_15_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_15_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_15_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_15_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_15_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_15_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_15_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_15_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_15_5_STATE.outTemplates[0])
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
                n_15_5_STATE.outMessages[0] = message
                n_15_5_STATE.messageTransferFunctions.splice(0, n_15_5_STATE.messageTransferFunctions.length - 1)
                n_15_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_15_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_15_5_STATE.messageTransferFunctions.length; i++) {
                    n_15_1_RCVS_0(n_15_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_15_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_15_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_15_1_STATE, msg_readFloatToken(m, 0))
                n_14_10_RCVS_1(msg_floats([n_15_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_14_10_RCVS_1(msg_floats([n_15_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_15_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_15_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_15_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_15_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_15_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_15_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_15_6_STATE.outTemplates[0])
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
                n_15_6_STATE.outMessages[0] = message
                n_15_6_STATE.messageTransferFunctions.splice(0, n_15_6_STATE.messageTransferFunctions.length - 1)
                n_15_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_15_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_15_6_STATE.messageTransferFunctions.length; i++) {
                    n_15_1_RCVS_0(n_15_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_15_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_16_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_16_7_STATE, msg_readFloatToken(m, 0))
                n_16_2_RCVS_1(msg_floats([n_16_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_16_2_RCVS_1(msg_floats([n_16_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_16_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_2_RCVS_0(m) {
                                
        if (!n_16_2_STATE.isClosed) {
            m_n_16_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_16_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_16_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_16_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_16_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_16_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_16_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_16_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_16_8_RCVS_0(msg_floats([n_16_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_16_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_16_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_16_8_STATE.currentValue) {
                    n_16_8_STATE.currentValue = newValue
                    n_16_11_RCVS_0(msg_floats([n_16_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_16_11_RCVS_0(msg_floats([n_16_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_16_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_16_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_11_RCVS_0(m) {
                                
        n_17_0_RCVS_0(msg_bang())
n_16_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_16_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_10_RCVS_0(m) {
                                
        if (!n_16_10_STATE.isClosed) {
            n_16_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_16_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_16_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_16_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_16_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_16_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_16_13_STATE.currentValue) {
                    n_16_13_STATE.currentValue = newValue
                    n_16_9_RCVS_0(msg_floats([n_16_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_16_9_RCVS_0(msg_floats([n_16_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_16_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_16_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_9_RCVS_0(m) {
                                
                if (n_16_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_16_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_16_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_16_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_16_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_16_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_16_9_STATE.stringFilter
                    ) {
                        n_16_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_16_9_STATE.floatFilter
                ) {
                    n_16_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_16_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_3_RCVS_0(m) {
                                
        n_16_5_RCVS_0(msg_bang())
n_13_0_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_16_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_5_RCVS_0(m) {
                                
        n_16_4_RCVS_0(msg_bang())
n_16_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_16_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_16_14_STATE, 
                            () => n_16_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_16_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_16_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_16_14_STATE,
                        () => n_16_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_16_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_16_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_16_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_16_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_16_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_16_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_16_6_STATE.outTemplates[0])
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
                n_16_6_STATE.outMessages[0] = message
                n_16_6_STATE.messageTransferFunctions.splice(0, n_16_6_STATE.messageTransferFunctions.length - 1)
                n_16_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_16_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_16_6_STATE.messageTransferFunctions.length; i++) {
                    n_16_7_RCVS_0(n_16_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_16_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_16_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_16_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_16_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_16_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_16_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_16_4_STATE.outTemplates[0])
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
                n_16_4_STATE.outMessages[0] = message
                n_16_4_STATE.messageTransferFunctions.splice(0, n_16_4_STATE.messageTransferFunctions.length - 1)
                n_16_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_16_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_16_4_STATE.messageTransferFunctions.length; i++) {
                    n_16_7_RCVS_0(n_16_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_16_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_17_0_RCVS_0(m) {
                                
        n_17_6_RCVS_0(msg_bang())
n_17_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_17_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_17_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_17_2_STATE, 
                            () => n_17_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_17_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_17_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_17_2_STATE,
                        () => n_17_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_17_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_17_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_17_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_17_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_17_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_17_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_17_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_17_5_STATE.outTemplates[0])
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
                n_17_5_STATE.outMessages[0] = message
                n_17_5_STATE.messageTransferFunctions.splice(0, n_17_5_STATE.messageTransferFunctions.length - 1)
                n_17_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_17_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_17_5_STATE.messageTransferFunctions.length; i++) {
                    n_17_1_RCVS_0(n_17_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_17_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_17_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_17_1_STATE, msg_readFloatToken(m, 0))
                n_16_10_RCVS_1(msg_floats([n_17_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_16_10_RCVS_1(msg_floats([n_17_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_17_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_17_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_17_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_17_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_17_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_17_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_17_6_STATE.outTemplates[0])
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
                n_17_6_STATE.outMessages[0] = message
                n_17_6_STATE.messageTransferFunctions.splice(0, n_17_6_STATE.messageTransferFunctions.length - 1)
                n_17_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_17_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_17_6_STATE.messageTransferFunctions.length; i++) {
                    n_17_1_RCVS_0(n_17_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_17_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_18_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_18_7_STATE, msg_readFloatToken(m, 0))
                n_18_2_RCVS_1(msg_floats([n_18_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_18_2_RCVS_1(msg_floats([n_18_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_18_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_2_RCVS_0(m) {
                                
        if (!n_18_2_STATE.isClosed) {
            m_n_18_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_18_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_18_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_18_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_18_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_18_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_18_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_18_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_18_8_RCVS_0(msg_floats([n_18_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_18_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_18_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_18_8_STATE.currentValue) {
                    n_18_8_STATE.currentValue = newValue
                    n_18_11_RCVS_0(msg_floats([n_18_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_18_11_RCVS_0(msg_floats([n_18_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_18_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_18_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_11_RCVS_0(m) {
                                
        n_19_0_RCVS_0(msg_bang())
n_18_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_18_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_10_RCVS_0(m) {
                                
        if (!n_18_10_STATE.isClosed) {
            n_18_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_18_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_18_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_18_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_18_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_18_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_18_13_STATE.currentValue) {
                    n_18_13_STATE.currentValue = newValue
                    n_18_9_RCVS_0(msg_floats([n_18_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_18_9_RCVS_0(msg_floats([n_18_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_18_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_18_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_9_RCVS_0(m) {
                                
                if (n_18_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_18_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_18_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_18_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_18_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_18_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_18_9_STATE.stringFilter
                    ) {
                        n_18_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_18_9_STATE.floatFilter
                ) {
                    n_18_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_18_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_3_RCVS_0(m) {
                                
        n_18_5_RCVS_0(msg_bang())
n_13_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_18_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_5_RCVS_0(m) {
                                
        n_18_4_RCVS_0(msg_bang())
n_18_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_18_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_18_14_STATE, 
                            () => n_18_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_18_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_18_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_18_14_STATE,
                        () => n_18_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_18_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_18_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_18_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_18_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_18_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_18_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_18_6_STATE.outTemplates[0])
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
                n_18_6_STATE.outMessages[0] = message
                n_18_6_STATE.messageTransferFunctions.splice(0, n_18_6_STATE.messageTransferFunctions.length - 1)
                n_18_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_18_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_18_6_STATE.messageTransferFunctions.length; i++) {
                    n_18_7_RCVS_0(n_18_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_18_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_18_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_18_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_18_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_18_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_18_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_18_4_STATE.outTemplates[0])
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
                n_18_4_STATE.outMessages[0] = message
                n_18_4_STATE.messageTransferFunctions.splice(0, n_18_4_STATE.messageTransferFunctions.length - 1)
                n_18_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_18_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_18_4_STATE.messageTransferFunctions.length; i++) {
                    n_18_7_RCVS_0(n_18_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_18_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_19_0_RCVS_0(m) {
                                
        n_19_6_RCVS_0(msg_bang())
n_19_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_19_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_19_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_19_2_STATE, 
                            () => n_19_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_19_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_19_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_19_2_STATE,
                        () => n_19_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_19_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_19_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_19_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_19_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_19_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_19_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_19_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_19_5_STATE.outTemplates[0])
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
                n_19_5_STATE.outMessages[0] = message
                n_19_5_STATE.messageTransferFunctions.splice(0, n_19_5_STATE.messageTransferFunctions.length - 1)
                n_19_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_19_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_19_5_STATE.messageTransferFunctions.length; i++) {
                    n_19_1_RCVS_0(n_19_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_19_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_19_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_19_1_STATE, msg_readFloatToken(m, 0))
                n_18_10_RCVS_1(msg_floats([n_19_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_18_10_RCVS_1(msg_floats([n_19_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_19_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_19_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_19_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_19_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_19_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_19_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_19_6_STATE.outTemplates[0])
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
                n_19_6_STATE.outMessages[0] = message
                n_19_6_STATE.messageTransferFunctions.splice(0, n_19_6_STATE.messageTransferFunctions.length - 1)
                n_19_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_19_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_19_6_STATE.messageTransferFunctions.length; i++) {
                    n_19_1_RCVS_0(n_19_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_19_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_20_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_20_7_STATE, msg_readFloatToken(m, 0))
                n_20_2_RCVS_1(msg_floats([n_20_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_20_2_RCVS_1(msg_floats([n_20_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_20_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_2_RCVS_0(m) {
                                
        if (!n_20_2_STATE.isClosed) {
            m_n_20_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_20_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_20_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_20_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_20_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_20_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_20_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_20_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_20_8_RCVS_0(msg_floats([n_20_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_20_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_20_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_20_8_STATE.currentValue) {
                    n_20_8_STATE.currentValue = newValue
                    n_20_11_RCVS_0(msg_floats([n_20_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_20_11_RCVS_0(msg_floats([n_20_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_20_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_20_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_11_RCVS_0(m) {
                                
        n_21_0_RCVS_0(msg_bang())
n_20_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_20_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_10_RCVS_0(m) {
                                
        if (!n_20_10_STATE.isClosed) {
            n_20_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_20_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_20_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_20_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_20_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_20_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_20_13_STATE.currentValue) {
                    n_20_13_STATE.currentValue = newValue
                    n_20_9_RCVS_0(msg_floats([n_20_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_20_9_RCVS_0(msg_floats([n_20_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_20_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_20_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_9_RCVS_0(m) {
                                
                if (n_20_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_20_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_20_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_20_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_20_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_20_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_20_9_STATE.stringFilter
                    ) {
                        n_20_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_20_9_STATE.floatFilter
                ) {
                    n_20_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_20_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_3_RCVS_0(m) {
                                
        n_20_5_RCVS_0(msg_bang())
n_13_7_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_20_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_5_RCVS_0(m) {
                                
        n_20_4_RCVS_0(msg_bang())
n_20_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_20_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_20_14_STATE, 
                            () => n_20_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_20_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_20_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_20_14_STATE,
                        () => n_20_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_20_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_20_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_20_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_20_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_20_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_20_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_20_6_STATE.outTemplates[0])
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
                n_20_6_STATE.outMessages[0] = message
                n_20_6_STATE.messageTransferFunctions.splice(0, n_20_6_STATE.messageTransferFunctions.length - 1)
                n_20_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_20_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_20_6_STATE.messageTransferFunctions.length; i++) {
                    n_20_7_RCVS_0(n_20_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_20_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_20_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_20_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_20_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_20_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_20_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_20_4_STATE.outTemplates[0])
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
                n_20_4_STATE.outMessages[0] = message
                n_20_4_STATE.messageTransferFunctions.splice(0, n_20_4_STATE.messageTransferFunctions.length - 1)
                n_20_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_20_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_20_4_STATE.messageTransferFunctions.length; i++) {
                    n_20_7_RCVS_0(n_20_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_20_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_21_0_RCVS_0(m) {
                                
        n_21_6_RCVS_0(msg_bang())
n_21_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_21_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_21_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_21_2_STATE, 
                            () => n_21_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_21_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_21_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_21_2_STATE,
                        () => n_21_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_21_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_21_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_21_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_21_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_21_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_21_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_21_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_21_5_STATE.outTemplates[0])
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
                n_21_5_STATE.outMessages[0] = message
                n_21_5_STATE.messageTransferFunctions.splice(0, n_21_5_STATE.messageTransferFunctions.length - 1)
                n_21_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_21_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_21_5_STATE.messageTransferFunctions.length; i++) {
                    n_21_1_RCVS_0(n_21_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_21_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_21_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_21_1_STATE, msg_readFloatToken(m, 0))
                n_20_10_RCVS_1(msg_floats([n_21_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_20_10_RCVS_1(msg_floats([n_21_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_21_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_21_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_21_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_21_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_21_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_21_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_21_6_STATE.outTemplates[0])
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
                n_21_6_STATE.outMessages[0] = message
                n_21_6_STATE.messageTransferFunctions.splice(0, n_21_6_STATE.messageTransferFunctions.length - 1)
                n_21_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_21_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_21_6_STATE.messageTransferFunctions.length; i++) {
                    n_21_1_RCVS_0(n_21_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_21_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_22_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_22_7_STATE, msg_readFloatToken(m, 0))
                n_22_2_RCVS_1(msg_floats([n_22_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_22_2_RCVS_1(msg_floats([n_22_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_22_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_2_RCVS_0(m) {
                                
        if (!n_22_2_STATE.isClosed) {
            m_n_22_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_22_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_22_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_22_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_22_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_22_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_22_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_22_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_22_8_RCVS_0(msg_floats([n_22_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_22_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_22_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_22_8_STATE.currentValue) {
                    n_22_8_STATE.currentValue = newValue
                    n_22_11_RCVS_0(msg_floats([n_22_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_22_11_RCVS_0(msg_floats([n_22_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_22_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_22_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_11_RCVS_0(m) {
                                
        n_23_0_RCVS_0(msg_bang())
n_22_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_22_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_10_RCVS_0(m) {
                                
        if (!n_22_10_STATE.isClosed) {
            n_22_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_22_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_22_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_22_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_22_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_22_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_22_13_STATE.currentValue) {
                    n_22_13_STATE.currentValue = newValue
                    n_22_9_RCVS_0(msg_floats([n_22_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_22_9_RCVS_0(msg_floats([n_22_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_22_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_22_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_9_RCVS_0(m) {
                                
                if (n_22_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_22_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_22_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_22_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_22_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_22_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_22_9_STATE.stringFilter
                    ) {
                        n_22_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_22_9_STATE.floatFilter
                ) {
                    n_22_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_22_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_3_RCVS_0(m) {
                                
        n_22_5_RCVS_0(msg_bang())
n_13_11_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_22_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_5_RCVS_0(m) {
                                
        n_22_4_RCVS_0(msg_bang())
n_22_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_22_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_22_14_STATE, 
                            () => n_22_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_22_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_22_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_22_14_STATE,
                        () => n_22_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_22_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_22_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_22_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_22_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_22_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_22_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_22_6_STATE.outTemplates[0])
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
                n_22_6_STATE.outMessages[0] = message
                n_22_6_STATE.messageTransferFunctions.splice(0, n_22_6_STATE.messageTransferFunctions.length - 1)
                n_22_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_22_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_22_6_STATE.messageTransferFunctions.length; i++) {
                    n_22_7_RCVS_0(n_22_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_22_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_22_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_22_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_22_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_22_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_22_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_22_4_STATE.outTemplates[0])
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
                n_22_4_STATE.outMessages[0] = message
                n_22_4_STATE.messageTransferFunctions.splice(0, n_22_4_STATE.messageTransferFunctions.length - 1)
                n_22_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_22_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_22_4_STATE.messageTransferFunctions.length; i++) {
                    n_22_7_RCVS_0(n_22_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_22_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_23_0_RCVS_0(m) {
                                
        n_23_6_RCVS_0(msg_bang())
n_23_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_23_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_23_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_23_2_STATE, 
                            () => n_23_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_23_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_23_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_23_2_STATE,
                        () => n_23_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_23_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_23_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_23_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_23_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_23_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_23_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_23_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_23_5_STATE.outTemplates[0])
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
                n_23_5_STATE.outMessages[0] = message
                n_23_5_STATE.messageTransferFunctions.splice(0, n_23_5_STATE.messageTransferFunctions.length - 1)
                n_23_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_23_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_23_5_STATE.messageTransferFunctions.length; i++) {
                    n_23_1_RCVS_0(n_23_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_23_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_23_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_23_1_STATE, msg_readFloatToken(m, 0))
                n_22_10_RCVS_1(msg_floats([n_23_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_22_10_RCVS_1(msg_floats([n_23_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_23_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_23_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_23_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_23_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_23_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_23_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_23_6_STATE.outTemplates[0])
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
                n_23_6_STATE.outMessages[0] = message
                n_23_6_STATE.messageTransferFunctions.splice(0, n_23_6_STATE.messageTransferFunctions.length - 1)
                n_23_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_23_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_23_6_STATE.messageTransferFunctions.length; i++) {
                    n_23_1_RCVS_0(n_23_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_23_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_24_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_24_7_STATE, msg_readFloatToken(m, 0))
                n_24_2_RCVS_1(msg_floats([n_24_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_24_2_RCVS_1(msg_floats([n_24_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_24_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_2_RCVS_0(m) {
                                
        if (!n_24_2_STATE.isClosed) {
            m_n_24_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_24_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_24_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_24_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_24_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_24_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_24_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_24_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_24_8_RCVS_0(msg_floats([n_24_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_24_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_24_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_24_8_STATE.currentValue) {
                    n_24_8_STATE.currentValue = newValue
                    n_24_11_RCVS_0(msg_floats([n_24_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_24_11_RCVS_0(msg_floats([n_24_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_24_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_24_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_11_RCVS_0(m) {
                                
        n_25_0_RCVS_0(msg_bang())
n_24_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_24_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_10_RCVS_0(m) {
                                
        if (!n_24_10_STATE.isClosed) {
            n_24_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_24_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_24_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_24_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_24_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_24_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_24_13_STATE.currentValue) {
                    n_24_13_STATE.currentValue = newValue
                    n_24_9_RCVS_0(msg_floats([n_24_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_24_9_RCVS_0(msg_floats([n_24_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_24_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_24_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_9_RCVS_0(m) {
                                
                if (n_24_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_24_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_24_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_24_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_24_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_24_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_24_9_STATE.stringFilter
                    ) {
                        n_24_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_24_9_STATE.floatFilter
                ) {
                    n_24_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_24_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_3_RCVS_0(m) {
                                
        n_24_5_RCVS_0(msg_bang())
n_13_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_24_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_5_RCVS_0(m) {
                                
        n_24_4_RCVS_0(msg_bang())
n_24_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_24_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_24_14_STATE, 
                            () => n_24_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_24_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_24_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_24_14_STATE,
                        () => n_24_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_24_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_24_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_24_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_24_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_24_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_24_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_24_6_STATE.outTemplates[0])
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
                n_24_6_STATE.outMessages[0] = message
                n_24_6_STATE.messageTransferFunctions.splice(0, n_24_6_STATE.messageTransferFunctions.length - 1)
                n_24_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_24_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_24_6_STATE.messageTransferFunctions.length; i++) {
                    n_24_7_RCVS_0(n_24_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_24_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_24_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_24_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_24_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_24_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_24_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_24_4_STATE.outTemplates[0])
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
                n_24_4_STATE.outMessages[0] = message
                n_24_4_STATE.messageTransferFunctions.splice(0, n_24_4_STATE.messageTransferFunctions.length - 1)
                n_24_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_24_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_24_4_STATE.messageTransferFunctions.length; i++) {
                    n_24_7_RCVS_0(n_24_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_24_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_25_0_RCVS_0(m) {
                                
        n_25_6_RCVS_0(msg_bang())
n_25_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_25_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_25_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_25_2_STATE, 
                            () => n_25_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_25_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_25_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_25_2_STATE,
                        () => n_25_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_25_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_25_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_25_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_25_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_25_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_25_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_25_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_25_5_STATE.outTemplates[0])
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
                n_25_5_STATE.outMessages[0] = message
                n_25_5_STATE.messageTransferFunctions.splice(0, n_25_5_STATE.messageTransferFunctions.length - 1)
                n_25_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_25_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_25_5_STATE.messageTransferFunctions.length; i++) {
                    n_25_1_RCVS_0(n_25_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_25_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_25_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_25_1_STATE, msg_readFloatToken(m, 0))
                n_24_10_RCVS_1(msg_floats([n_25_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_24_10_RCVS_1(msg_floats([n_25_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_25_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_25_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_25_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_25_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_25_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_25_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_25_6_STATE.outTemplates[0])
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
                n_25_6_STATE.outMessages[0] = message
                n_25_6_STATE.messageTransferFunctions.splice(0, n_25_6_STATE.messageTransferFunctions.length - 1)
                n_25_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_25_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_25_6_STATE.messageTransferFunctions.length; i++) {
                    n_25_1_RCVS_0(n_25_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_25_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_26_0_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_0_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_34_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_26_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_26_34_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_26_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_1_RCVS_0(m) {
                                
                if (n_26_1_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_26_1_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_26_1_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_26_1_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_26_1_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_26_2_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_26_1_STATE.stringFilter
                    ) {
                        n_26_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_26_1_STATE.floatFilter
                ) {
                    n_26_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_26_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_12_RCVS_0(m) {
                                
            msgBusPublish(n_12_12_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_12_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_4_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_4_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_35_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_26_5_RCVS_0(msg_floats([Math.floor(Math.random() * n_26_35_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_26_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_5_RCVS_0(m) {
                                
                if (n_26_5_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_26_5_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_26_5_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_26_5_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_26_5_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_26_6_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_26_5_STATE.stringFilter
                    ) {
                        n_26_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_26_5_STATE.floatFilter
                ) {
                    n_26_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_26_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_6_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_6_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_11_RCVS_0(m) {
                                
            msgBusPublish(n_12_11_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_12_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_7_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_7_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_36_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_26_36_SNDS_0(msg_floats([Math.floor(Math.random() * n_26_36_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_26_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_8_RCVS_0(m) {
                                
                if (n_26_8_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_26_8_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_26_8_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_26_8_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_26_8_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_26_9_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_26_8_STATE.stringFilter
                    ) {
                        n_26_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_26_8_STATE.floatFilter
                ) {
                    n_26_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_26_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_9_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_9_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_10_RCVS_0(m) {
                                
            msgBusPublish(n_12_10_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_12_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_10_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_26_10_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_26_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_11_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_11_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_37_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_26_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_26_37_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_26_37", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_12_RCVS_0(m) {
                                
                if (n_26_12_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_26_12_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_26_12_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_26_12_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_26_12_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_26_13_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_26_12_STATE.stringFilter
                    ) {
                        n_26_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_26_12_STATE.floatFilter
                ) {
                    n_26_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_26_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_13_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_13_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_9_RCVS_0(m) {
                                
            msgBusPublish(n_12_9_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_12_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_16_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_16_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_33_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_26_17_RCVS_0(msg_floats([Math.floor(Math.random() * n_26_33_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_26_33", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_17_RCVS_0(m) {
                                
                if (n_26_17_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_26_17_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_26_17_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_26_17_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_26_17_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_26_18_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_26_17_STATE.stringFilter
                    ) {
                        n_26_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_26_17_STATE.floatFilter
                ) {
                    n_26_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_26_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_18_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_18_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_13_RCVS_0(m) {
                                
            msgBusPublish(n_12_13_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_12_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_19_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_26_19_STATE, m)
            return
        
                                throw new Error('[bang], id "n_26_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_38_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_26_20_RCVS_0(msg_floats([Math.floor(Math.random() * n_26_38_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_26_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_20_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_26_21_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_26_22_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_26_23_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_26_24_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_26_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_21_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_21_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_21_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_21_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_21_STATE.outTemplates[0])
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
                n_26_21_STATE.outMessages[0] = message
                n_26_21_STATE.messageTransferFunctions.splice(0, n_26_21_STATE.messageTransferFunctions.length - 1)
                n_26_21_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_21_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_21_STATE.messageTransferFunctions.length; i++) {
                    n_12_8_RCVS_0(n_26_21_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_12_8_RCVS_0(m) {
                                
            msgBusPublish(n_12_8_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_12_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_22_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_22_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_22_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_22_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_22_STATE.outTemplates[0])
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
                n_26_22_STATE.outMessages[0] = message
                n_26_22_STATE.messageTransferFunctions.splice(0, n_26_22_STATE.messageTransferFunctions.length - 1)
                n_26_22_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_22_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_22_STATE.messageTransferFunctions.length; i++) {
                    n_12_8_RCVS_0(n_26_22_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_23_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_23_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_23_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_23_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_23_STATE.outTemplates[0])
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
                n_26_23_STATE.outMessages[0] = message
                n_26_23_STATE.messageTransferFunctions.splice(0, n_26_23_STATE.messageTransferFunctions.length - 1)
                n_26_23_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_23_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_23_STATE.messageTransferFunctions.length; i++) {
                    n_12_8_RCVS_0(n_26_23_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_26_24_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_24_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_24_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_24_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_24_STATE.outTemplates[0])
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
                n_26_24_STATE.outMessages[0] = message
                n_26_24_STATE.messageTransferFunctions.splice(0, n_26_24_STATE.messageTransferFunctions.length - 1)
                n_26_24_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_24_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_24_STATE.messageTransferFunctions.length; i++) {
                    n_12_8_RCVS_0(n_26_24_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_24", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_26_27_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_27_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_27_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_27_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_27_STATE.outTemplates[0])
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
                n_26_27_STATE.outMessages[0] = message
                n_26_27_STATE.messageTransferFunctions.splice(0, n_26_27_STATE.messageTransferFunctions.length - 1)
                n_26_27_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_27_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_27_STATE.messageTransferFunctions.length; i++) {
                    n_27_17_RCVS_1(n_26_27_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_27", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_27_17_OUTS_0 = 0
function n_27_17_RCVS_1(m) {
                                
                            n_27_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_27_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_26_28_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_28_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_28_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_28_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_28_STATE.outTemplates[0])
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
                n_26_28_STATE.outMessages[0] = message
                n_26_28_STATE.messageTransferFunctions.splice(0, n_26_28_STATE.messageTransferFunctions.length - 1)
                n_26_28_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_28_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_28_STATE.messageTransferFunctions.length; i++) {
                    n_29_17_RCVS_1(n_26_28_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_28", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_29_17_OUTS_0 = 0
function n_29_17_RCVS_1(m) {
                                
                            n_29_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_29_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_26_29_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_29_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_29_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_29_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_29_STATE.outTemplates[0])
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
                n_26_29_STATE.outMessages[0] = message
                n_26_29_STATE.messageTransferFunctions.splice(0, n_26_29_STATE.messageTransferFunctions.length - 1)
                n_26_29_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_29_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_29_STATE.messageTransferFunctions.length; i++) {
                    n_31_17_RCVS_1(n_26_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_31_17_OUTS_0 = 0
function n_31_17_RCVS_1(m) {
                                
                            n_31_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_31_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_26_30_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_30_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_30_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_30_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_30_STATE.outTemplates[0])
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
                n_26_30_STATE.outMessages[0] = message
                n_26_30_STATE.messageTransferFunctions.splice(0, n_26_30_STATE.messageTransferFunctions.length - 1)
                n_26_30_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_30_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_30_STATE.messageTransferFunctions.length; i++) {
                    n_33_17_RCVS_1(n_26_30_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_30", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_33_17_OUTS_0 = 0
function n_33_17_RCVS_1(m) {
                                
                            n_33_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_33_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_26_31_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_31_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_31_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_31_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_31_STATE.outTemplates[0])
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
                n_26_31_STATE.outMessages[0] = message
                n_26_31_STATE.messageTransferFunctions.splice(0, n_26_31_STATE.messageTransferFunctions.length - 1)
                n_26_31_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_31_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_31_STATE.messageTransferFunctions.length; i++) {
                    n_35_17_RCVS_1(n_26_31_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_31", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_35_17_OUTS_0 = 0
function n_35_17_RCVS_1(m) {
                                
                            n_35_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_35_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_26_32_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_26_32_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_26_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_26_32_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_26_32_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_26_32_STATE.outTemplates[0])
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
                n_26_32_STATE.outMessages[0] = message
                n_26_32_STATE.messageTransferFunctions.splice(0, n_26_32_STATE.messageTransferFunctions.length - 1)
                n_26_32_STATE.messageTransferFunctions[0] = function (m) {
                    return n_26_32_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_26_32_STATE.messageTransferFunctions.length; i++) {
                    n_37_17_RCVS_1(n_26_32_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_26_32", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_37_17_OUTS_0 = 0
function n_37_17_RCVS_1(m) {
                                
                            n_37_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_37_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_27_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_27_7_STATE, msg_readFloatToken(m, 0))
                n_27_2_RCVS_1(msg_floats([n_27_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_27_2_RCVS_1(msg_floats([n_27_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_27_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_2_RCVS_0(m) {
                                
        if (!n_27_2_STATE.isClosed) {
            m_n_27_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_27_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_27_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_27_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_27_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_27_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_27_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_27_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_27_8_RCVS_0(msg_floats([n_27_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_27_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_27_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_27_8_STATE.currentValue) {
                    n_27_8_STATE.currentValue = newValue
                    n_27_11_RCVS_0(msg_floats([n_27_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_27_11_RCVS_0(msg_floats([n_27_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_27_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_27_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_11_RCVS_0(m) {
                                
        n_28_0_RCVS_0(msg_bang())
n_27_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_27_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_10_RCVS_0(m) {
                                
        if (!n_27_10_STATE.isClosed) {
            n_27_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_27_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_27_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_27_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_27_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_27_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_27_13_STATE.currentValue) {
                    n_27_13_STATE.currentValue = newValue
                    n_27_9_RCVS_0(msg_floats([n_27_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_27_9_RCVS_0(msg_floats([n_27_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_27_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_27_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_9_RCVS_0(m) {
                                
                if (n_27_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_27_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_27_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_27_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_27_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_27_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_27_9_STATE.stringFilter
                    ) {
                        n_27_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_27_9_STATE.floatFilter
                ) {
                    n_27_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_27_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_3_RCVS_0(m) {
                                
        n_27_5_RCVS_0(msg_bang())
n_26_16_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_27_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_5_RCVS_0(m) {
                                
        n_27_4_RCVS_0(msg_bang())
n_27_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_27_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_27_14_STATE, 
                            () => n_27_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_27_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_27_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_27_14_STATE,
                        () => n_27_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_27_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_27_14", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_27_7_RCVS_0(n_27_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_27_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_27_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_27_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_27_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_27_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_27_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_27_4_STATE.outTemplates[0])
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
                n_27_4_STATE.outMessages[0] = message
                n_27_4_STATE.messageTransferFunctions.splice(0, n_27_4_STATE.messageTransferFunctions.length - 1)
                n_27_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_27_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_27_4_STATE.messageTransferFunctions.length; i++) {
                    n_27_7_RCVS_0(n_27_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_27_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_0_RCVS_0(m) {
                                
        n_28_6_RCVS_0(msg_bang())
n_28_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_28_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_28_2_STATE, 
                            () => n_28_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_28_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_28_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_28_2_STATE,
                        () => n_28_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_28_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_28_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_28_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_28_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_28_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_28_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_28_5_STATE.outTemplates[0])
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
                n_28_5_STATE.outMessages[0] = message
                n_28_5_STATE.messageTransferFunctions.splice(0, n_28_5_STATE.messageTransferFunctions.length - 1)
                n_28_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_28_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_28_5_STATE.messageTransferFunctions.length; i++) {
                    n_28_1_RCVS_0(n_28_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_28_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_28_1_STATE, msg_readFloatToken(m, 0))
                n_27_10_RCVS_1(msg_floats([n_28_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_27_10_RCVS_1(msg_floats([n_28_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_28_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_28_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_28_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_28_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_28_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_28_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_28_6_STATE.outTemplates[0])
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
                n_28_6_STATE.outMessages[0] = message
                n_28_6_STATE.messageTransferFunctions.splice(0, n_28_6_STATE.messageTransferFunctions.length - 1)
                n_28_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_28_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_28_6_STATE.messageTransferFunctions.length; i++) {
                    n_28_1_RCVS_0(n_28_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_28_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_29_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_29_7_STATE, msg_readFloatToken(m, 0))
                n_29_2_RCVS_1(msg_floats([n_29_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_29_2_RCVS_1(msg_floats([n_29_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_29_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_2_RCVS_0(m) {
                                
        if (!n_29_2_STATE.isClosed) {
            m_n_29_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_29_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_29_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_29_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_29_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_29_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_29_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_29_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_29_8_RCVS_0(msg_floats([n_29_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_29_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_29_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_29_8_STATE.currentValue) {
                    n_29_8_STATE.currentValue = newValue
                    n_29_11_RCVS_0(msg_floats([n_29_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_29_11_RCVS_0(msg_floats([n_29_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_29_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_29_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_11_RCVS_0(m) {
                                
        n_30_0_RCVS_0(msg_bang())
n_29_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_29_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_10_RCVS_0(m) {
                                
        if (!n_29_10_STATE.isClosed) {
            n_29_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_29_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_29_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_29_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_29_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_29_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_29_13_STATE.currentValue) {
                    n_29_13_STATE.currentValue = newValue
                    n_29_9_RCVS_0(msg_floats([n_29_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_29_9_RCVS_0(msg_floats([n_29_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_29_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_29_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_9_RCVS_0(m) {
                                
                if (n_29_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_29_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_29_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_29_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_29_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_29_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_29_9_STATE.stringFilter
                    ) {
                        n_29_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_29_9_STATE.floatFilter
                ) {
                    n_29_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_29_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_3_RCVS_0(m) {
                                
        n_29_5_RCVS_0(msg_bang())
n_26_0_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_29_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_5_RCVS_0(m) {
                                
        n_29_4_RCVS_0(msg_bang())
n_29_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_29_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_29_14_STATE, 
                            () => n_29_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_29_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_29_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_29_14_STATE,
                        () => n_29_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_29_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_29_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_29_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_29_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_29_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_29_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_29_6_STATE.outTemplates[0])
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
                n_29_6_STATE.outMessages[0] = message
                n_29_6_STATE.messageTransferFunctions.splice(0, n_29_6_STATE.messageTransferFunctions.length - 1)
                n_29_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_29_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_29_6_STATE.messageTransferFunctions.length; i++) {
                    n_29_7_RCVS_0(n_29_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_29_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_29_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_29_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_29_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_29_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_29_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_29_4_STATE.outTemplates[0])
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
                n_29_4_STATE.outMessages[0] = message
                n_29_4_STATE.messageTransferFunctions.splice(0, n_29_4_STATE.messageTransferFunctions.length - 1)
                n_29_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_29_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_29_4_STATE.messageTransferFunctions.length; i++) {
                    n_29_7_RCVS_0(n_29_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_29_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_30_0_RCVS_0(m) {
                                
        n_30_6_RCVS_0(msg_bang())
n_30_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_30_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_30_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_30_2_STATE, 
                            () => n_30_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_30_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_30_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_30_2_STATE,
                        () => n_30_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_30_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_30_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_30_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_30_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_30_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_30_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_30_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_30_5_STATE.outTemplates[0])
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
                n_30_5_STATE.outMessages[0] = message
                n_30_5_STATE.messageTransferFunctions.splice(0, n_30_5_STATE.messageTransferFunctions.length - 1)
                n_30_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_30_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_30_5_STATE.messageTransferFunctions.length; i++) {
                    n_30_1_RCVS_0(n_30_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_30_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_30_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_30_1_STATE, msg_readFloatToken(m, 0))
                n_29_10_RCVS_1(msg_floats([n_30_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_29_10_RCVS_1(msg_floats([n_30_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_30_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_30_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_30_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_30_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_30_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_30_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_30_6_STATE.outTemplates[0])
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
                n_30_6_STATE.outMessages[0] = message
                n_30_6_STATE.messageTransferFunctions.splice(0, n_30_6_STATE.messageTransferFunctions.length - 1)
                n_30_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_30_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_30_6_STATE.messageTransferFunctions.length; i++) {
                    n_30_1_RCVS_0(n_30_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_30_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_31_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_31_7_STATE, msg_readFloatToken(m, 0))
                n_31_2_RCVS_1(msg_floats([n_31_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_31_2_RCVS_1(msg_floats([n_31_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_31_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_2_RCVS_0(m) {
                                
        if (!n_31_2_STATE.isClosed) {
            m_n_31_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_31_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_31_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_31_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_31_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_31_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_31_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_31_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_31_8_RCVS_0(msg_floats([n_31_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_31_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_31_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_31_8_STATE.currentValue) {
                    n_31_8_STATE.currentValue = newValue
                    n_31_11_RCVS_0(msg_floats([n_31_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_31_11_RCVS_0(msg_floats([n_31_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_31_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_31_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_11_RCVS_0(m) {
                                
        n_32_0_RCVS_0(msg_bang())
n_31_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_31_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_10_RCVS_0(m) {
                                
        if (!n_31_10_STATE.isClosed) {
            n_31_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_31_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_31_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_31_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_31_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_31_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_31_13_STATE.currentValue) {
                    n_31_13_STATE.currentValue = newValue
                    n_31_9_RCVS_0(msg_floats([n_31_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_31_9_RCVS_0(msg_floats([n_31_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_31_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_31_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_9_RCVS_0(m) {
                                
                if (n_31_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_31_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_31_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_31_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_31_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_31_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_31_9_STATE.stringFilter
                    ) {
                        n_31_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_31_9_STATE.floatFilter
                ) {
                    n_31_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_31_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_3_RCVS_0(m) {
                                
        n_31_5_RCVS_0(msg_bang())
n_26_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_31_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_5_RCVS_0(m) {
                                
        n_31_4_RCVS_0(msg_bang())
n_31_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_31_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_31_14_STATE, 
                            () => n_31_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_31_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_31_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_31_14_STATE,
                        () => n_31_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_31_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_31_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_31_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_31_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_31_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_31_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_31_6_STATE.outTemplates[0])
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
                n_31_6_STATE.outMessages[0] = message
                n_31_6_STATE.messageTransferFunctions.splice(0, n_31_6_STATE.messageTransferFunctions.length - 1)
                n_31_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_31_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_31_6_STATE.messageTransferFunctions.length; i++) {
                    n_31_7_RCVS_0(n_31_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_31_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_31_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_31_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_31_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_31_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_31_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_31_4_STATE.outTemplates[0])
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
                n_31_4_STATE.outMessages[0] = message
                n_31_4_STATE.messageTransferFunctions.splice(0, n_31_4_STATE.messageTransferFunctions.length - 1)
                n_31_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_31_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_31_4_STATE.messageTransferFunctions.length; i++) {
                    n_31_7_RCVS_0(n_31_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_31_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_32_0_RCVS_0(m) {
                                
        n_32_6_RCVS_0(msg_bang())
n_32_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_32_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_32_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_32_2_STATE, 
                            () => n_32_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_32_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_32_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_32_2_STATE,
                        () => n_32_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_32_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_32_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_32_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_32_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_32_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_32_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_32_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_32_5_STATE.outTemplates[0])
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
                n_32_5_STATE.outMessages[0] = message
                n_32_5_STATE.messageTransferFunctions.splice(0, n_32_5_STATE.messageTransferFunctions.length - 1)
                n_32_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_32_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_32_5_STATE.messageTransferFunctions.length; i++) {
                    n_32_1_RCVS_0(n_32_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_32_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_32_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_32_1_STATE, msg_readFloatToken(m, 0))
                n_31_10_RCVS_1(msg_floats([n_32_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_31_10_RCVS_1(msg_floats([n_32_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_32_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_32_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_32_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_32_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_32_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_32_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_32_6_STATE.outTemplates[0])
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
                n_32_6_STATE.outMessages[0] = message
                n_32_6_STATE.messageTransferFunctions.splice(0, n_32_6_STATE.messageTransferFunctions.length - 1)
                n_32_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_32_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_32_6_STATE.messageTransferFunctions.length; i++) {
                    n_32_1_RCVS_0(n_32_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_32_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_33_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_33_7_STATE, msg_readFloatToken(m, 0))
                n_33_2_RCVS_1(msg_floats([n_33_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_33_2_RCVS_1(msg_floats([n_33_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_33_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_2_RCVS_0(m) {
                                
        if (!n_33_2_STATE.isClosed) {
            m_n_33_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_33_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_33_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_33_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_33_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_33_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_33_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_33_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_33_8_RCVS_0(msg_floats([n_33_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_33_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_33_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_33_8_STATE.currentValue) {
                    n_33_8_STATE.currentValue = newValue
                    n_33_11_RCVS_0(msg_floats([n_33_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_33_11_RCVS_0(msg_floats([n_33_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_33_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_33_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_11_RCVS_0(m) {
                                
        n_34_0_RCVS_0(msg_bang())
n_33_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_33_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_10_RCVS_0(m) {
                                
        if (!n_33_10_STATE.isClosed) {
            n_33_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_33_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_33_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_33_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_33_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_33_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_33_13_STATE.currentValue) {
                    n_33_13_STATE.currentValue = newValue
                    n_33_9_RCVS_0(msg_floats([n_33_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_33_9_RCVS_0(msg_floats([n_33_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_33_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_33_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_9_RCVS_0(m) {
                                
                if (n_33_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_33_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_33_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_33_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_33_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_33_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_33_9_STATE.stringFilter
                    ) {
                        n_33_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_33_9_STATE.floatFilter
                ) {
                    n_33_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_33_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_3_RCVS_0(m) {
                                
        n_33_5_RCVS_0(msg_bang())
n_26_7_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_33_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_5_RCVS_0(m) {
                                
        n_33_4_RCVS_0(msg_bang())
n_33_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_33_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_33_14_STATE, 
                            () => n_33_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_33_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_33_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_33_14_STATE,
                        () => n_33_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_33_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_33_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_33_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_33_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_33_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_33_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_33_6_STATE.outTemplates[0])
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
                n_33_6_STATE.outMessages[0] = message
                n_33_6_STATE.messageTransferFunctions.splice(0, n_33_6_STATE.messageTransferFunctions.length - 1)
                n_33_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_33_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_33_6_STATE.messageTransferFunctions.length; i++) {
                    n_33_7_RCVS_0(n_33_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_33_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_33_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_33_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_33_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_33_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_33_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_33_4_STATE.outTemplates[0])
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
                n_33_4_STATE.outMessages[0] = message
                n_33_4_STATE.messageTransferFunctions.splice(0, n_33_4_STATE.messageTransferFunctions.length - 1)
                n_33_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_33_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_33_4_STATE.messageTransferFunctions.length; i++) {
                    n_33_7_RCVS_0(n_33_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_33_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_34_0_RCVS_0(m) {
                                
        n_34_6_RCVS_0(msg_bang())
n_34_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_34_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_34_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_34_2_STATE, 
                            () => n_34_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_34_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_34_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_34_2_STATE,
                        () => n_34_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_34_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_34_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_34_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_34_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_34_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_34_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_34_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_34_5_STATE.outTemplates[0])
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
                n_34_5_STATE.outMessages[0] = message
                n_34_5_STATE.messageTransferFunctions.splice(0, n_34_5_STATE.messageTransferFunctions.length - 1)
                n_34_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_34_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_34_5_STATE.messageTransferFunctions.length; i++) {
                    n_34_1_RCVS_0(n_34_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_34_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_34_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_34_1_STATE, msg_readFloatToken(m, 0))
                n_33_10_RCVS_1(msg_floats([n_34_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_33_10_RCVS_1(msg_floats([n_34_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_34_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_34_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_34_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_34_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_34_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_34_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_34_6_STATE.outTemplates[0])
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
                n_34_6_STATE.outMessages[0] = message
                n_34_6_STATE.messageTransferFunctions.splice(0, n_34_6_STATE.messageTransferFunctions.length - 1)
                n_34_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_34_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_34_6_STATE.messageTransferFunctions.length; i++) {
                    n_34_1_RCVS_0(n_34_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_34_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_35_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_35_7_STATE, msg_readFloatToken(m, 0))
                n_35_2_RCVS_1(msg_floats([n_35_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_35_2_RCVS_1(msg_floats([n_35_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_35_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_2_RCVS_0(m) {
                                
        if (!n_35_2_STATE.isClosed) {
            m_n_35_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_35_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_35_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_35_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_35_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_35_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_35_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_35_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_35_8_RCVS_0(msg_floats([n_35_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_35_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_35_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_35_8_STATE.currentValue) {
                    n_35_8_STATE.currentValue = newValue
                    n_35_11_RCVS_0(msg_floats([n_35_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_35_11_RCVS_0(msg_floats([n_35_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_35_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_35_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_11_RCVS_0(m) {
                                
        n_36_0_RCVS_0(msg_bang())
n_35_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_35_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_10_RCVS_0(m) {
                                
        if (!n_35_10_STATE.isClosed) {
            n_35_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_35_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_35_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_35_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_35_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_35_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_35_13_STATE.currentValue) {
                    n_35_13_STATE.currentValue = newValue
                    n_35_9_RCVS_0(msg_floats([n_35_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_35_9_RCVS_0(msg_floats([n_35_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_35_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_35_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_9_RCVS_0(m) {
                                
                if (n_35_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_35_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_35_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_35_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_35_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_35_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_35_9_STATE.stringFilter
                    ) {
                        n_35_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_35_9_STATE.floatFilter
                ) {
                    n_35_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_35_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_3_RCVS_0(m) {
                                
        n_35_5_RCVS_0(msg_bang())
n_26_11_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_35_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_5_RCVS_0(m) {
                                
        n_35_4_RCVS_0(msg_bang())
n_35_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_35_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_35_14_STATE, 
                            () => n_35_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_35_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_35_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_35_14_STATE,
                        () => n_35_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_35_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_35_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_35_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_35_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_35_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_35_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_35_6_STATE.outTemplates[0])
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
                n_35_6_STATE.outMessages[0] = message
                n_35_6_STATE.messageTransferFunctions.splice(0, n_35_6_STATE.messageTransferFunctions.length - 1)
                n_35_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_35_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_35_6_STATE.messageTransferFunctions.length; i++) {
                    n_35_7_RCVS_0(n_35_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_35_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_35_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_35_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_35_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_35_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_35_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_35_4_STATE.outTemplates[0])
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
                n_35_4_STATE.outMessages[0] = message
                n_35_4_STATE.messageTransferFunctions.splice(0, n_35_4_STATE.messageTransferFunctions.length - 1)
                n_35_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_35_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_35_4_STATE.messageTransferFunctions.length; i++) {
                    n_35_7_RCVS_0(n_35_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_35_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_36_0_RCVS_0(m) {
                                
        n_36_6_RCVS_0(msg_bang())
n_36_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_36_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_36_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_36_2_STATE, 
                            () => n_36_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_36_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_36_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_36_2_STATE,
                        () => n_36_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_36_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_36_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_36_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_36_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_36_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_36_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_36_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_36_5_STATE.outTemplates[0])
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
                n_36_5_STATE.outMessages[0] = message
                n_36_5_STATE.messageTransferFunctions.splice(0, n_36_5_STATE.messageTransferFunctions.length - 1)
                n_36_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_36_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_36_5_STATE.messageTransferFunctions.length; i++) {
                    n_36_1_RCVS_0(n_36_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_36_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_36_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_36_1_STATE, msg_readFloatToken(m, 0))
                n_35_10_RCVS_1(msg_floats([n_36_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_35_10_RCVS_1(msg_floats([n_36_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_36_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_36_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_36_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_36_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_36_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_36_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_36_6_STATE.outTemplates[0])
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
                n_36_6_STATE.outMessages[0] = message
                n_36_6_STATE.messageTransferFunctions.splice(0, n_36_6_STATE.messageTransferFunctions.length - 1)
                n_36_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_36_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_36_6_STATE.messageTransferFunctions.length; i++) {
                    n_36_1_RCVS_0(n_36_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_36_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_37_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_37_7_STATE, msg_readFloatToken(m, 0))
                n_37_2_RCVS_1(msg_floats([n_37_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_37_2_RCVS_1(msg_floats([n_37_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_37_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_2_RCVS_0(m) {
                                
        if (!n_37_2_STATE.isClosed) {
            m_n_37_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_37_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_37_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_37_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_37_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_37_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_37_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_37_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_37_8_RCVS_0(msg_floats([n_37_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_37_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_37_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_37_8_STATE.currentValue) {
                    n_37_8_STATE.currentValue = newValue
                    n_37_11_RCVS_0(msg_floats([n_37_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_37_11_RCVS_0(msg_floats([n_37_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_37_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_37_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_11_RCVS_0(m) {
                                
        n_38_0_RCVS_0(msg_bang())
n_37_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_37_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_10_RCVS_0(m) {
                                
        if (!n_37_10_STATE.isClosed) {
            n_37_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_37_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_37_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_37_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_37_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_37_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_37_13_STATE.currentValue) {
                    n_37_13_STATE.currentValue = newValue
                    n_37_9_RCVS_0(msg_floats([n_37_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_37_9_RCVS_0(msg_floats([n_37_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_37_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_37_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_9_RCVS_0(m) {
                                
                if (n_37_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_37_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_37_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_37_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_37_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_37_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_37_9_STATE.stringFilter
                    ) {
                        n_37_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_37_9_STATE.floatFilter
                ) {
                    n_37_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_37_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_3_RCVS_0(m) {
                                
        n_37_5_RCVS_0(msg_bang())
n_26_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_37_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_5_RCVS_0(m) {
                                
        n_37_4_RCVS_0(msg_bang())
n_37_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_37_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_37_14_STATE, 
                            () => n_37_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_37_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_37_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_37_14_STATE,
                        () => n_37_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_37_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_37_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_37_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_37_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_37_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_37_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_37_6_STATE.outTemplates[0])
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
                n_37_6_STATE.outMessages[0] = message
                n_37_6_STATE.messageTransferFunctions.splice(0, n_37_6_STATE.messageTransferFunctions.length - 1)
                n_37_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_37_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_37_6_STATE.messageTransferFunctions.length; i++) {
                    n_37_7_RCVS_0(n_37_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_37_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_37_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_37_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_37_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_37_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_37_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_37_4_STATE.outTemplates[0])
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
                n_37_4_STATE.outMessages[0] = message
                n_37_4_STATE.messageTransferFunctions.splice(0, n_37_4_STATE.messageTransferFunctions.length - 1)
                n_37_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_37_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_37_4_STATE.messageTransferFunctions.length; i++) {
                    n_37_7_RCVS_0(n_37_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_37_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_38_0_RCVS_0(m) {
                                
        n_38_6_RCVS_0(msg_bang())
n_38_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_38_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_38_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_38_2_STATE, 
                            () => n_38_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_38_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_38_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_38_2_STATE,
                        () => n_38_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_38_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_38_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_38_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_38_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_38_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_38_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_38_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_38_5_STATE.outTemplates[0])
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
                n_38_5_STATE.outMessages[0] = message
                n_38_5_STATE.messageTransferFunctions.splice(0, n_38_5_STATE.messageTransferFunctions.length - 1)
                n_38_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_38_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_38_5_STATE.messageTransferFunctions.length; i++) {
                    n_38_1_RCVS_0(n_38_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_38_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_38_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_38_1_STATE, msg_readFloatToken(m, 0))
                n_37_10_RCVS_1(msg_floats([n_38_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_37_10_RCVS_1(msg_floats([n_38_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_38_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_38_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_38_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_38_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_38_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_38_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_38_6_STATE.outTemplates[0])
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
                n_38_6_STATE.outMessages[0] = message
                n_38_6_STATE.messageTransferFunctions.splice(0, n_38_6_STATE.messageTransferFunctions.length - 1)
                n_38_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_38_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_38_6_STATE.messageTransferFunctions.length; i++) {
                    n_38_1_RCVS_0(n_38_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_38_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_39_0_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_0_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_34_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_39_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_39_34_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_39_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_1_RCVS_0(m) {
                                
                if (n_39_1_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_39_1_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_39_1_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_39_1_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_39_1_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_39_2_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_39_1_STATE.stringFilter
                    ) {
                        n_39_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_39_1_STATE.floatFilter
                ) {
                    n_39_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_39_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_12_RCVS_0(m) {
                                
            msgBusPublish(n_11_12_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_11_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_4_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_4_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_35_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_39_5_RCVS_0(msg_floats([Math.floor(Math.random() * n_39_35_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_39_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_5_RCVS_0(m) {
                                
                if (n_39_5_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_39_5_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_39_5_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_39_5_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_39_5_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_39_6_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_39_5_STATE.stringFilter
                    ) {
                        n_39_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_39_5_STATE.floatFilter
                ) {
                    n_39_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_39_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_6_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_6_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_11_RCVS_0(m) {
                                
            msgBusPublish(n_11_11_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_11_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_7_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_7_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_36_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_39_36_SNDS_0(msg_floats([Math.floor(Math.random() * n_39_36_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_39_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_8_RCVS_0(m) {
                                
                if (n_39_8_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_39_8_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_39_8_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_39_8_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_39_8_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_39_9_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_39_8_STATE.stringFilter
                    ) {
                        n_39_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_39_8_STATE.floatFilter
                ) {
                    n_39_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_39_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_9_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_9_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_10_RCVS_0(m) {
                                
            msgBusPublish(n_11_10_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_11_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_10_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_39_10_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_39_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_11_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_11_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_37_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_39_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_39_37_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_39_37", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_12_RCVS_0(m) {
                                
                if (n_39_12_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_39_12_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_39_12_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_39_12_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_39_12_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_39_13_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_39_12_STATE.stringFilter
                    ) {
                        n_39_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_39_12_STATE.floatFilter
                ) {
                    n_39_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_39_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_13_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_13_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_9_RCVS_0(m) {
                                
            msgBusPublish(n_11_9_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_11_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_16_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_16_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_33_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_39_17_RCVS_0(msg_floats([Math.floor(Math.random() * n_39_33_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_39_33", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_17_RCVS_0(m) {
                                
                if (n_39_17_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_39_17_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_39_17_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_39_17_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_39_17_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_39_18_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_39_17_STATE.stringFilter
                    ) {
                        n_39_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_39_17_STATE.floatFilter
                ) {
                    n_39_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_39_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_18_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_18_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_13_RCVS_0(m) {
                                
            msgBusPublish(n_11_13_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_11_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_19_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_39_19_STATE, m)
            return
        
                                throw new Error('[bang], id "n_39_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_38_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_39_20_RCVS_0(msg_floats([Math.floor(Math.random() * n_39_38_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_39_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_20_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_39_21_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_39_22_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_39_23_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_39_24_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_39_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_21_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_21_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_21_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_21_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_21_STATE.outTemplates[0])
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
                n_39_21_STATE.outMessages[0] = message
                n_39_21_STATE.messageTransferFunctions.splice(0, n_39_21_STATE.messageTransferFunctions.length - 1)
                n_39_21_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_21_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_21_STATE.messageTransferFunctions.length; i++) {
                    n_11_8_RCVS_0(n_39_21_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_11_8_RCVS_0(m) {
                                
            msgBusPublish(n_11_8_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_11_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_22_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_22_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_22_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_22_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_22_STATE.outTemplates[0])
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
                n_39_22_STATE.outMessages[0] = message
                n_39_22_STATE.messageTransferFunctions.splice(0, n_39_22_STATE.messageTransferFunctions.length - 1)
                n_39_22_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_22_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_22_STATE.messageTransferFunctions.length; i++) {
                    n_11_8_RCVS_0(n_39_22_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_23_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_23_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_23_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_23_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_23_STATE.outTemplates[0])
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
                n_39_23_STATE.outMessages[0] = message
                n_39_23_STATE.messageTransferFunctions.splice(0, n_39_23_STATE.messageTransferFunctions.length - 1)
                n_39_23_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_23_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_23_STATE.messageTransferFunctions.length; i++) {
                    n_11_8_RCVS_0(n_39_23_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_39_24_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_24_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_24_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_24_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_24_STATE.outTemplates[0])
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
                n_39_24_STATE.outMessages[0] = message
                n_39_24_STATE.messageTransferFunctions.splice(0, n_39_24_STATE.messageTransferFunctions.length - 1)
                n_39_24_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_24_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_24_STATE.messageTransferFunctions.length; i++) {
                    n_11_8_RCVS_0(n_39_24_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_24", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_39_27_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_27_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_27_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_27_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_27_STATE.outTemplates[0])
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
                n_39_27_STATE.outMessages[0] = message
                n_39_27_STATE.messageTransferFunctions.splice(0, n_39_27_STATE.messageTransferFunctions.length - 1)
                n_39_27_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_27_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_27_STATE.messageTransferFunctions.length; i++) {
                    n_40_17_RCVS_1(n_39_27_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_27", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_40_17_OUTS_0 = 0
function n_40_17_RCVS_1(m) {
                                
                            n_40_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_40_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_39_28_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_28_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_28_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_28_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_28_STATE.outTemplates[0])
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
                n_39_28_STATE.outMessages[0] = message
                n_39_28_STATE.messageTransferFunctions.splice(0, n_39_28_STATE.messageTransferFunctions.length - 1)
                n_39_28_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_28_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_28_STATE.messageTransferFunctions.length; i++) {
                    n_42_17_RCVS_1(n_39_28_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_28", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_42_17_OUTS_0 = 0
function n_42_17_RCVS_1(m) {
                                
                            n_42_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_42_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_39_29_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_29_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_29_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_29_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_29_STATE.outTemplates[0])
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
                n_39_29_STATE.outMessages[0] = message
                n_39_29_STATE.messageTransferFunctions.splice(0, n_39_29_STATE.messageTransferFunctions.length - 1)
                n_39_29_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_29_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_29_STATE.messageTransferFunctions.length; i++) {
                    n_44_17_RCVS_1(n_39_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_44_17_OUTS_0 = 0
function n_44_17_RCVS_1(m) {
                                
                            n_44_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_44_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_39_30_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_30_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_30_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_30_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_30_STATE.outTemplates[0])
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
                n_39_30_STATE.outMessages[0] = message
                n_39_30_STATE.messageTransferFunctions.splice(0, n_39_30_STATE.messageTransferFunctions.length - 1)
                n_39_30_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_30_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_30_STATE.messageTransferFunctions.length; i++) {
                    n_46_17_RCVS_1(n_39_30_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_30", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_46_17_OUTS_0 = 0
function n_46_17_RCVS_1(m) {
                                
                            n_46_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_46_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_39_31_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_31_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_31_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_31_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_31_STATE.outTemplates[0])
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
                n_39_31_STATE.outMessages[0] = message
                n_39_31_STATE.messageTransferFunctions.splice(0, n_39_31_STATE.messageTransferFunctions.length - 1)
                n_39_31_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_31_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_31_STATE.messageTransferFunctions.length; i++) {
                    n_48_17_RCVS_1(n_39_31_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_31", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_48_17_OUTS_0 = 0
function n_48_17_RCVS_1(m) {
                                
                            n_48_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_48_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_39_32_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_39_32_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_39_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_39_32_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_39_32_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_39_32_STATE.outTemplates[0])
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
                n_39_32_STATE.outMessages[0] = message
                n_39_32_STATE.messageTransferFunctions.splice(0, n_39_32_STATE.messageTransferFunctions.length - 1)
                n_39_32_STATE.messageTransferFunctions[0] = function (m) {
                    return n_39_32_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_39_32_STATE.messageTransferFunctions.length; i++) {
                    n_50_17_RCVS_1(n_39_32_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_39_32", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_50_17_OUTS_0 = 0
function n_50_17_RCVS_1(m) {
                                
                            n_50_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_50_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_40_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_40_7_STATE, msg_readFloatToken(m, 0))
                n_40_2_RCVS_1(msg_floats([n_40_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_40_2_RCVS_1(msg_floats([n_40_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_40_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_2_RCVS_0(m) {
                                
        if (!n_40_2_STATE.isClosed) {
            m_n_40_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_40_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_40_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_40_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_40_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_40_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_40_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_40_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_40_8_RCVS_0(msg_floats([n_40_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_40_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_40_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_40_8_STATE.currentValue) {
                    n_40_8_STATE.currentValue = newValue
                    n_40_11_RCVS_0(msg_floats([n_40_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_40_11_RCVS_0(msg_floats([n_40_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_40_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_40_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_11_RCVS_0(m) {
                                
        n_41_0_RCVS_0(msg_bang())
n_40_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_40_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_10_RCVS_0(m) {
                                
        if (!n_40_10_STATE.isClosed) {
            n_40_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_40_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_40_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_40_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_40_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_40_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_40_13_STATE.currentValue) {
                    n_40_13_STATE.currentValue = newValue
                    n_40_9_RCVS_0(msg_floats([n_40_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_40_9_RCVS_0(msg_floats([n_40_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_40_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_40_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_9_RCVS_0(m) {
                                
                if (n_40_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_40_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_40_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_40_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_40_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_40_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_40_9_STATE.stringFilter
                    ) {
                        n_40_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_40_9_STATE.floatFilter
                ) {
                    n_40_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_40_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_3_RCVS_0(m) {
                                
        n_40_5_RCVS_0(msg_bang())
n_39_16_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_40_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_5_RCVS_0(m) {
                                
        n_40_4_RCVS_0(msg_bang())
n_40_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_40_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_40_14_STATE, 
                            () => n_40_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_40_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_40_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_40_14_STATE,
                        () => n_40_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_40_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_40_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_40_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_40_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_40_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_40_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_40_6_STATE.outTemplates[0])
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
                n_40_6_STATE.outMessages[0] = message
                n_40_6_STATE.messageTransferFunctions.splice(0, n_40_6_STATE.messageTransferFunctions.length - 1)
                n_40_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_40_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_40_6_STATE.messageTransferFunctions.length; i++) {
                    n_40_7_RCVS_0(n_40_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_40_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_40_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_40_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_40_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_40_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_40_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_40_4_STATE.outTemplates[0])
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
                n_40_4_STATE.outMessages[0] = message
                n_40_4_STATE.messageTransferFunctions.splice(0, n_40_4_STATE.messageTransferFunctions.length - 1)
                n_40_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_40_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_40_4_STATE.messageTransferFunctions.length; i++) {
                    n_40_7_RCVS_0(n_40_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_40_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_41_0_RCVS_0(m) {
                                
        n_41_6_RCVS_0(msg_bang())
n_41_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_41_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_41_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_41_2_STATE, 
                            () => n_41_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_41_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_41_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_41_2_STATE,
                        () => n_41_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_41_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_41_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_41_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_41_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_41_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_41_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_41_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_41_5_STATE.outTemplates[0])
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
                n_41_5_STATE.outMessages[0] = message
                n_41_5_STATE.messageTransferFunctions.splice(0, n_41_5_STATE.messageTransferFunctions.length - 1)
                n_41_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_41_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_41_5_STATE.messageTransferFunctions.length; i++) {
                    n_41_1_RCVS_0(n_41_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_41_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_41_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_41_1_STATE, msg_readFloatToken(m, 0))
                n_40_10_RCVS_1(msg_floats([n_41_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_40_10_RCVS_1(msg_floats([n_41_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_41_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_41_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_41_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_41_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_41_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_41_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_41_6_STATE.outTemplates[0])
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
                n_41_6_STATE.outMessages[0] = message
                n_41_6_STATE.messageTransferFunctions.splice(0, n_41_6_STATE.messageTransferFunctions.length - 1)
                n_41_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_41_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_41_6_STATE.messageTransferFunctions.length; i++) {
                    n_41_1_RCVS_0(n_41_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_41_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_42_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_42_7_STATE, msg_readFloatToken(m, 0))
                n_42_2_RCVS_1(msg_floats([n_42_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_42_2_RCVS_1(msg_floats([n_42_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_42_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_2_RCVS_0(m) {
                                
        if (!n_42_2_STATE.isClosed) {
            m_n_42_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_42_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_42_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_42_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_42_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_42_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_42_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_42_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_42_8_RCVS_0(msg_floats([n_42_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_42_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_42_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_42_8_STATE.currentValue) {
                    n_42_8_STATE.currentValue = newValue
                    n_42_11_RCVS_0(msg_floats([n_42_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_42_11_RCVS_0(msg_floats([n_42_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_42_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_42_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_11_RCVS_0(m) {
                                
        n_43_0_RCVS_0(msg_bang())
n_42_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_42_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_10_RCVS_0(m) {
                                
        if (!n_42_10_STATE.isClosed) {
            n_42_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_42_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_42_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_42_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_42_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_42_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_42_13_STATE.currentValue) {
                    n_42_13_STATE.currentValue = newValue
                    n_42_9_RCVS_0(msg_floats([n_42_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_42_9_RCVS_0(msg_floats([n_42_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_42_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_42_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_9_RCVS_0(m) {
                                
                if (n_42_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_42_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_42_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_42_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_42_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_42_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_42_9_STATE.stringFilter
                    ) {
                        n_42_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_42_9_STATE.floatFilter
                ) {
                    n_42_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_42_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_3_RCVS_0(m) {
                                
        n_42_5_RCVS_0(msg_bang())
n_39_0_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_42_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_5_RCVS_0(m) {
                                
        n_42_4_RCVS_0(msg_bang())
n_42_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_42_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_42_14_STATE, 
                            () => n_42_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_42_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_42_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_42_14_STATE,
                        () => n_42_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_42_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_42_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_42_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_42_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_42_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_42_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_42_6_STATE.outTemplates[0])
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
                n_42_6_STATE.outMessages[0] = message
                n_42_6_STATE.messageTransferFunctions.splice(0, n_42_6_STATE.messageTransferFunctions.length - 1)
                n_42_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_42_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_42_6_STATE.messageTransferFunctions.length; i++) {
                    n_42_7_RCVS_0(n_42_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_42_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_42_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_42_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_42_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_42_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_42_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_42_4_STATE.outTemplates[0])
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
                n_42_4_STATE.outMessages[0] = message
                n_42_4_STATE.messageTransferFunctions.splice(0, n_42_4_STATE.messageTransferFunctions.length - 1)
                n_42_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_42_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_42_4_STATE.messageTransferFunctions.length; i++) {
                    n_42_7_RCVS_0(n_42_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_42_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_43_0_RCVS_0(m) {
                                
        n_43_6_RCVS_0(msg_bang())
n_43_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_43_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_43_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_43_2_STATE, 
                            () => n_43_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_43_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_43_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_43_2_STATE,
                        () => n_43_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_43_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_43_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_43_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_43_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_43_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_43_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_43_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_43_5_STATE.outTemplates[0])
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
                n_43_5_STATE.outMessages[0] = message
                n_43_5_STATE.messageTransferFunctions.splice(0, n_43_5_STATE.messageTransferFunctions.length - 1)
                n_43_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_43_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_43_5_STATE.messageTransferFunctions.length; i++) {
                    n_43_1_RCVS_0(n_43_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_43_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_43_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_43_1_STATE, msg_readFloatToken(m, 0))
                n_42_10_RCVS_1(msg_floats([n_43_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_42_10_RCVS_1(msg_floats([n_43_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_43_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_43_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_43_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_43_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_43_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_43_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_43_6_STATE.outTemplates[0])
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
                n_43_6_STATE.outMessages[0] = message
                n_43_6_STATE.messageTransferFunctions.splice(0, n_43_6_STATE.messageTransferFunctions.length - 1)
                n_43_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_43_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_43_6_STATE.messageTransferFunctions.length; i++) {
                    n_43_1_RCVS_0(n_43_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_43_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_44_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_44_7_STATE, msg_readFloatToken(m, 0))
                n_44_2_RCVS_1(msg_floats([n_44_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_44_2_RCVS_1(msg_floats([n_44_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_44_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_2_RCVS_0(m) {
                                
        if (!n_44_2_STATE.isClosed) {
            m_n_44_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_44_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_44_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_44_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_44_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_44_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_44_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_44_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_44_8_RCVS_0(msg_floats([n_44_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_44_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_44_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_44_8_STATE.currentValue) {
                    n_44_8_STATE.currentValue = newValue
                    n_44_11_RCVS_0(msg_floats([n_44_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_44_11_RCVS_0(msg_floats([n_44_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_44_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_44_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_11_RCVS_0(m) {
                                
        n_45_0_RCVS_0(msg_bang())
n_44_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_44_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_10_RCVS_0(m) {
                                
        if (!n_44_10_STATE.isClosed) {
            n_44_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_44_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_44_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_44_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_44_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_44_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_44_13_STATE.currentValue) {
                    n_44_13_STATE.currentValue = newValue
                    n_44_9_RCVS_0(msg_floats([n_44_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_44_9_RCVS_0(msg_floats([n_44_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_44_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_44_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_9_RCVS_0(m) {
                                
                if (n_44_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_44_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_44_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_44_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_44_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_44_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_44_9_STATE.stringFilter
                    ) {
                        n_44_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_44_9_STATE.floatFilter
                ) {
                    n_44_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_44_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_3_RCVS_0(m) {
                                
        n_44_5_RCVS_0(msg_bang())
n_39_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_44_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_5_RCVS_0(m) {
                                
        n_44_4_RCVS_0(msg_bang())
n_44_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_44_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_44_14_STATE, 
                            () => n_44_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_44_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_44_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_44_14_STATE,
                        () => n_44_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_44_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_44_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_44_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_44_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_44_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_44_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_44_6_STATE.outTemplates[0])
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
                n_44_6_STATE.outMessages[0] = message
                n_44_6_STATE.messageTransferFunctions.splice(0, n_44_6_STATE.messageTransferFunctions.length - 1)
                n_44_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_44_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_44_6_STATE.messageTransferFunctions.length; i++) {
                    n_44_7_RCVS_0(n_44_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_44_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_44_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_44_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_44_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_44_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_44_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_44_4_STATE.outTemplates[0])
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
                n_44_4_STATE.outMessages[0] = message
                n_44_4_STATE.messageTransferFunctions.splice(0, n_44_4_STATE.messageTransferFunctions.length - 1)
                n_44_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_44_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_44_4_STATE.messageTransferFunctions.length; i++) {
                    n_44_7_RCVS_0(n_44_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_44_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_45_0_RCVS_0(m) {
                                
        n_45_6_RCVS_0(msg_bang())
n_45_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_45_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_45_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_45_2_STATE, 
                            () => n_45_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_45_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_45_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_45_2_STATE,
                        () => n_45_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_45_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_45_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_45_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_45_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_45_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_45_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_45_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_45_5_STATE.outTemplates[0])
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
                n_45_5_STATE.outMessages[0] = message
                n_45_5_STATE.messageTransferFunctions.splice(0, n_45_5_STATE.messageTransferFunctions.length - 1)
                n_45_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_45_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_45_5_STATE.messageTransferFunctions.length; i++) {
                    n_45_1_RCVS_0(n_45_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_45_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_45_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_45_1_STATE, msg_readFloatToken(m, 0))
                n_44_10_RCVS_1(msg_floats([n_45_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_44_10_RCVS_1(msg_floats([n_45_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_45_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_45_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_45_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_45_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_45_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_45_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_45_6_STATE.outTemplates[0])
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
                n_45_6_STATE.outMessages[0] = message
                n_45_6_STATE.messageTransferFunctions.splice(0, n_45_6_STATE.messageTransferFunctions.length - 1)
                n_45_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_45_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_45_6_STATE.messageTransferFunctions.length; i++) {
                    n_45_1_RCVS_0(n_45_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_45_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_46_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_46_7_STATE, msg_readFloatToken(m, 0))
                n_46_2_RCVS_1(msg_floats([n_46_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_46_2_RCVS_1(msg_floats([n_46_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_46_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_2_RCVS_0(m) {
                                
        if (!n_46_2_STATE.isClosed) {
            m_n_46_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_46_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_46_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_46_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_46_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_46_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_46_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_46_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_46_8_RCVS_0(msg_floats([n_46_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_46_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_46_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_46_8_STATE.currentValue) {
                    n_46_8_STATE.currentValue = newValue
                    n_46_11_RCVS_0(msg_floats([n_46_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_46_11_RCVS_0(msg_floats([n_46_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_46_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_46_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_11_RCVS_0(m) {
                                
        n_47_0_RCVS_0(msg_bang())
n_46_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_46_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_10_RCVS_0(m) {
                                
        if (!n_46_10_STATE.isClosed) {
            n_46_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_46_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_46_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_46_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_46_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_46_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_46_13_STATE.currentValue) {
                    n_46_13_STATE.currentValue = newValue
                    n_46_9_RCVS_0(msg_floats([n_46_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_46_9_RCVS_0(msg_floats([n_46_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_46_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_46_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_9_RCVS_0(m) {
                                
                if (n_46_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_46_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_46_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_46_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_46_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_46_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_46_9_STATE.stringFilter
                    ) {
                        n_46_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_46_9_STATE.floatFilter
                ) {
                    n_46_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_46_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_3_RCVS_0(m) {
                                
        n_46_5_RCVS_0(msg_bang())
n_39_7_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_46_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_5_RCVS_0(m) {
                                
        n_46_4_RCVS_0(msg_bang())
n_46_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_46_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_46_14_STATE, 
                            () => n_46_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_46_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_46_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_46_14_STATE,
                        () => n_46_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_46_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_46_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_46_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_46_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_46_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_46_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_46_6_STATE.outTemplates[0])
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
                n_46_6_STATE.outMessages[0] = message
                n_46_6_STATE.messageTransferFunctions.splice(0, n_46_6_STATE.messageTransferFunctions.length - 1)
                n_46_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_46_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_46_6_STATE.messageTransferFunctions.length; i++) {
                    n_46_7_RCVS_0(n_46_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_46_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_46_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_46_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_46_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_46_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_46_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_46_4_STATE.outTemplates[0])
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
                n_46_4_STATE.outMessages[0] = message
                n_46_4_STATE.messageTransferFunctions.splice(0, n_46_4_STATE.messageTransferFunctions.length - 1)
                n_46_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_46_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_46_4_STATE.messageTransferFunctions.length; i++) {
                    n_46_7_RCVS_0(n_46_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_46_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_47_0_RCVS_0(m) {
                                
        n_47_6_RCVS_0(msg_bang())
n_47_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_47_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_47_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_47_2_STATE, 
                            () => n_47_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_47_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_47_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_47_2_STATE,
                        () => n_47_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_47_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_47_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_47_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_47_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_47_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_47_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_47_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_47_5_STATE.outTemplates[0])
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
                n_47_5_STATE.outMessages[0] = message
                n_47_5_STATE.messageTransferFunctions.splice(0, n_47_5_STATE.messageTransferFunctions.length - 1)
                n_47_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_47_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_47_5_STATE.messageTransferFunctions.length; i++) {
                    n_47_1_RCVS_0(n_47_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_47_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_47_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_47_1_STATE, msg_readFloatToken(m, 0))
                n_46_10_RCVS_1(msg_floats([n_47_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_46_10_RCVS_1(msg_floats([n_47_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_47_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_47_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_47_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_47_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_47_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_47_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_47_6_STATE.outTemplates[0])
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
                n_47_6_STATE.outMessages[0] = message
                n_47_6_STATE.messageTransferFunctions.splice(0, n_47_6_STATE.messageTransferFunctions.length - 1)
                n_47_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_47_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_47_6_STATE.messageTransferFunctions.length; i++) {
                    n_47_1_RCVS_0(n_47_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_47_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_48_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_48_7_STATE, msg_readFloatToken(m, 0))
                n_48_2_RCVS_1(msg_floats([n_48_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_48_2_RCVS_1(msg_floats([n_48_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_48_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_2_RCVS_0(m) {
                                
        if (!n_48_2_STATE.isClosed) {
            m_n_48_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_48_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_48_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_48_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_48_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_48_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_48_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_48_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_48_8_RCVS_0(msg_floats([n_48_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_48_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_48_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_48_8_STATE.currentValue) {
                    n_48_8_STATE.currentValue = newValue
                    n_48_11_RCVS_0(msg_floats([n_48_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_48_11_RCVS_0(msg_floats([n_48_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_48_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_48_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_11_RCVS_0(m) {
                                
        n_49_0_RCVS_0(msg_bang())
n_48_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_48_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_10_RCVS_0(m) {
                                
        if (!n_48_10_STATE.isClosed) {
            n_48_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_48_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_48_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_48_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_48_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_48_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_48_13_STATE.currentValue) {
                    n_48_13_STATE.currentValue = newValue
                    n_48_9_RCVS_0(msg_floats([n_48_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_48_9_RCVS_0(msg_floats([n_48_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_48_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_48_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_9_RCVS_0(m) {
                                
                if (n_48_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_48_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_48_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_48_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_48_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_48_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_48_9_STATE.stringFilter
                    ) {
                        n_48_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_48_9_STATE.floatFilter
                ) {
                    n_48_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_48_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_3_RCVS_0(m) {
                                
        n_48_5_RCVS_0(msg_bang())
n_39_11_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_48_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_5_RCVS_0(m) {
                                
        n_48_4_RCVS_0(msg_bang())
n_48_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_48_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_48_14_STATE, 
                            () => n_48_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_48_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_48_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_48_14_STATE,
                        () => n_48_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_48_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_48_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_48_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_48_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_48_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_48_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_48_6_STATE.outTemplates[0])
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
                n_48_6_STATE.outMessages[0] = message
                n_48_6_STATE.messageTransferFunctions.splice(0, n_48_6_STATE.messageTransferFunctions.length - 1)
                n_48_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_48_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_48_6_STATE.messageTransferFunctions.length; i++) {
                    n_48_7_RCVS_0(n_48_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_48_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_48_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_48_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_48_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_48_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_48_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_48_4_STATE.outTemplates[0])
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
                n_48_4_STATE.outMessages[0] = message
                n_48_4_STATE.messageTransferFunctions.splice(0, n_48_4_STATE.messageTransferFunctions.length - 1)
                n_48_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_48_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_48_4_STATE.messageTransferFunctions.length; i++) {
                    n_48_7_RCVS_0(n_48_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_48_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_49_0_RCVS_0(m) {
                                
        n_49_6_RCVS_0(msg_bang())
n_49_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_49_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_49_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_49_2_STATE, 
                            () => n_49_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_49_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_49_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_49_2_STATE,
                        () => n_49_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_49_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_49_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_49_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_49_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_49_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_49_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_49_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_49_5_STATE.outTemplates[0])
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
                n_49_5_STATE.outMessages[0] = message
                n_49_5_STATE.messageTransferFunctions.splice(0, n_49_5_STATE.messageTransferFunctions.length - 1)
                n_49_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_49_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_49_5_STATE.messageTransferFunctions.length; i++) {
                    n_49_1_RCVS_0(n_49_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_49_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_49_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_49_1_STATE, msg_readFloatToken(m, 0))
                n_48_10_RCVS_1(msg_floats([n_49_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_48_10_RCVS_1(msg_floats([n_49_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_49_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_49_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_49_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_49_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_49_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_49_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_49_6_STATE.outTemplates[0])
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
                n_49_6_STATE.outMessages[0] = message
                n_49_6_STATE.messageTransferFunctions.splice(0, n_49_6_STATE.messageTransferFunctions.length - 1)
                n_49_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_49_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_49_6_STATE.messageTransferFunctions.length; i++) {
                    n_49_1_RCVS_0(n_49_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_49_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_50_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_50_7_STATE, msg_readFloatToken(m, 0))
                n_50_2_RCVS_1(msg_floats([n_50_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_50_2_RCVS_1(msg_floats([n_50_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_50_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_2_RCVS_0(m) {
                                
        if (!n_50_2_STATE.isClosed) {
            m_n_50_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_50_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_50_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_50_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_50_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_50_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_50_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_50_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_50_8_RCVS_0(msg_floats([n_50_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_50_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_50_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_50_8_STATE.currentValue) {
                    n_50_8_STATE.currentValue = newValue
                    n_50_11_RCVS_0(msg_floats([n_50_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_50_11_RCVS_0(msg_floats([n_50_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_50_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_50_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_11_RCVS_0(m) {
                                
        n_51_0_RCVS_0(msg_bang())
n_50_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_50_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_10_RCVS_0(m) {
                                
        if (!n_50_10_STATE.isClosed) {
            n_50_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_50_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_50_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_50_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_50_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_50_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_50_13_STATE.currentValue) {
                    n_50_13_STATE.currentValue = newValue
                    n_50_9_RCVS_0(msg_floats([n_50_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_50_9_RCVS_0(msg_floats([n_50_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_50_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_50_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_9_RCVS_0(m) {
                                
                if (n_50_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_50_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_50_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_50_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_50_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_50_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_50_9_STATE.stringFilter
                    ) {
                        n_50_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_50_9_STATE.floatFilter
                ) {
                    n_50_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_50_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_3_RCVS_0(m) {
                                
        n_50_5_RCVS_0(msg_bang())
n_39_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_50_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_5_RCVS_0(m) {
                                
        n_50_4_RCVS_0(msg_bang())
n_50_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_50_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_50_14_STATE, 
                            () => n_50_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_50_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_50_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_50_14_STATE,
                        () => n_50_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_50_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_50_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_50_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_50_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_50_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_50_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_50_6_STATE.outTemplates[0])
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
                n_50_6_STATE.outMessages[0] = message
                n_50_6_STATE.messageTransferFunctions.splice(0, n_50_6_STATE.messageTransferFunctions.length - 1)
                n_50_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_50_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_50_6_STATE.messageTransferFunctions.length; i++) {
                    n_50_7_RCVS_0(n_50_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_50_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_50_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_50_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_50_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_50_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_50_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_50_4_STATE.outTemplates[0])
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
                n_50_4_STATE.outMessages[0] = message
                n_50_4_STATE.messageTransferFunctions.splice(0, n_50_4_STATE.messageTransferFunctions.length - 1)
                n_50_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_50_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_50_4_STATE.messageTransferFunctions.length; i++) {
                    n_50_7_RCVS_0(n_50_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_50_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_51_0_RCVS_0(m) {
                                
        n_51_6_RCVS_0(msg_bang())
n_51_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_51_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_51_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_51_2_STATE, 
                            () => n_51_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_51_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_51_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_51_2_STATE,
                        () => n_51_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_51_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_51_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_51_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_51_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_51_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_51_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_51_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_51_5_STATE.outTemplates[0])
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
                n_51_5_STATE.outMessages[0] = message
                n_51_5_STATE.messageTransferFunctions.splice(0, n_51_5_STATE.messageTransferFunctions.length - 1)
                n_51_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_51_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_51_5_STATE.messageTransferFunctions.length; i++) {
                    n_51_1_RCVS_0(n_51_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_51_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_51_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_51_1_STATE, msg_readFloatToken(m, 0))
                n_50_10_RCVS_1(msg_floats([n_51_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_50_10_RCVS_1(msg_floats([n_51_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_51_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_51_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_51_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_51_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_51_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_51_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_51_6_STATE.outTemplates[0])
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
                n_51_6_STATE.outMessages[0] = message
                n_51_6_STATE.messageTransferFunctions.splice(0, n_51_6_STATE.messageTransferFunctions.length - 1)
                n_51_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_51_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_51_6_STATE.messageTransferFunctions.length; i++) {
                    n_51_1_RCVS_0(n_51_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_51_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_52_0_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_0_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_34_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_52_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_52_34_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_52_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_1_RCVS_0(m) {
                                
                if (n_52_1_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_52_1_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_52_1_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_52_1_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_52_1_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_52_2_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_52_1_STATE.stringFilter
                    ) {
                        n_52_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_52_1_STATE.floatFilter
                ) {
                    n_52_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_52_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_2_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_2_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_8_RCVS_0(m) {
                                
            msgBusPublish(n_10_8_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_10_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_4_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_4_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_35_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_52_5_RCVS_0(msg_floats([Math.floor(Math.random() * n_52_35_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_52_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_5_RCVS_0(m) {
                                
                if (n_52_5_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_52_5_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_52_5_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_52_5_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_52_5_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_52_6_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_52_5_STATE.stringFilter
                    ) {
                        n_52_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_52_5_STATE.floatFilter
                ) {
                    n_52_6_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_52_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_6_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_6_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_9_RCVS_0(m) {
                                
            msgBusPublish(n_10_9_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_10_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_7_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_7_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_36_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_52_36_SNDS_0(msg_floats([Math.floor(Math.random() * n_52_36_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_52_36", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_8_RCVS_0(m) {
                                
                if (n_52_8_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_52_8_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_52_8_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_52_8_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_52_8_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_52_9_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_52_8_STATE.stringFilter
                    ) {
                        n_52_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_52_8_STATE.floatFilter
                ) {
                    n_52_9_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_52_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_9_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_9_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_10_RCVS_0(m) {
                                
            msgBusPublish(n_10_10_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_10_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_10_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_52_10_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_52_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_11_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_11_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_37_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_52_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_52_37_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_52_37", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_12_RCVS_0(m) {
                                
                if (n_52_12_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_52_12_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_52_12_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_52_12_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_52_12_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_52_13_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_52_12_STATE.stringFilter
                    ) {
                        n_52_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_52_12_STATE.floatFilter
                ) {
                    n_52_13_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_52_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_13_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_13_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_11_RCVS_0(m) {
                                
            msgBusPublish(n_10_11_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_10_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_16_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_16_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_33_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_52_17_RCVS_0(msg_floats([Math.floor(Math.random() * n_52_33_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_52_33", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_17_RCVS_0(m) {
                                
                if (n_52_17_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_52_17_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_52_17_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_52_17_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_52_17_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_52_18_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_52_17_STATE.stringFilter
                    ) {
                        n_52_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_52_17_STATE.floatFilter
                ) {
                    n_52_18_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_52_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_18_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_18_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_7_RCVS_0(m) {
                                
            msgBusPublish(n_10_7_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_10_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_19_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_52_19_STATE, m)
            return
        
                                throw new Error('[bang], id "n_52_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_38_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_52_20_RCVS_0(msg_floats([Math.floor(Math.random() * n_52_38_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_52_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_20_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_52_21_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_52_22_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_52_23_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_52_24_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_52_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_21_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_21_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_21_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_21_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_21_STATE.outTemplates[0])
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
                n_52_21_STATE.outMessages[0] = message
                n_52_21_STATE.messageTransferFunctions.splice(0, n_52_21_STATE.messageTransferFunctions.length - 1)
                n_52_21_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_21_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_21_STATE.messageTransferFunctions.length; i++) {
                    n_10_12_RCVS_0(n_52_21_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_10_12_RCVS_0(m) {
                                
            msgBusPublish(n_10_12_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_10_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_22_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_22_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_22_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_22_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_22_STATE.outTemplates[0])
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
                n_52_22_STATE.outMessages[0] = message
                n_52_22_STATE.messageTransferFunctions.splice(0, n_52_22_STATE.messageTransferFunctions.length - 1)
                n_52_22_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_22_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_22_STATE.messageTransferFunctions.length; i++) {
                    n_10_12_RCVS_0(n_52_22_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_23_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_23_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_23_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_23_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_23_STATE.outTemplates[0])
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
                n_52_23_STATE.outMessages[0] = message
                n_52_23_STATE.messageTransferFunctions.splice(0, n_52_23_STATE.messageTransferFunctions.length - 1)
                n_52_23_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_23_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_23_STATE.messageTransferFunctions.length; i++) {
                    n_10_12_RCVS_0(n_52_23_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_52_24_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_24_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_24_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_24_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_24_STATE.outTemplates[0])
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
                n_52_24_STATE.outMessages[0] = message
                n_52_24_STATE.messageTransferFunctions.splice(0, n_52_24_STATE.messageTransferFunctions.length - 1)
                n_52_24_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_24_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_24_STATE.messageTransferFunctions.length; i++) {
                    n_10_12_RCVS_0(n_52_24_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_24", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_52_27_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_27_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_27_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_27_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_27_STATE.outTemplates[0])
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
                n_52_27_STATE.outMessages[0] = message
                n_52_27_STATE.messageTransferFunctions.splice(0, n_52_27_STATE.messageTransferFunctions.length - 1)
                n_52_27_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_27_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_27_STATE.messageTransferFunctions.length; i++) {
                    n_53_17_RCVS_1(n_52_27_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_27", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_53_17_OUTS_0 = 0
function n_53_17_RCVS_1(m) {
                                
                            n_53_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_53_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_52_28_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_28_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_28_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_28_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_28_STATE.outTemplates[0])
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
                n_52_28_STATE.outMessages[0] = message
                n_52_28_STATE.messageTransferFunctions.splice(0, n_52_28_STATE.messageTransferFunctions.length - 1)
                n_52_28_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_28_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_28_STATE.messageTransferFunctions.length; i++) {
                    n_55_17_RCVS_1(n_52_28_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_28", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_55_17_OUTS_0 = 0
function n_55_17_RCVS_1(m) {
                                
                            n_55_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_55_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_52_29_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_29_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_29_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_29_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_29_STATE.outTemplates[0])
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
                n_52_29_STATE.outMessages[0] = message
                n_52_29_STATE.messageTransferFunctions.splice(0, n_52_29_STATE.messageTransferFunctions.length - 1)
                n_52_29_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_29_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_29_STATE.messageTransferFunctions.length; i++) {
                    n_57_17_RCVS_1(n_52_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_57_17_OUTS_0 = 0
function n_57_17_RCVS_1(m) {
                                
                            n_57_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_57_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_52_30_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_30_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_30_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_30_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_30_STATE.outTemplates[0])
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
                n_52_30_STATE.outMessages[0] = message
                n_52_30_STATE.messageTransferFunctions.splice(0, n_52_30_STATE.messageTransferFunctions.length - 1)
                n_52_30_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_30_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_30_STATE.messageTransferFunctions.length; i++) {
                    n_59_17_RCVS_1(n_52_30_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_30", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_59_17_OUTS_0 = 0
function n_59_17_RCVS_1(m) {
                                
                            n_59_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_59_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_52_31_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_31_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_31_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_31_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_31_STATE.outTemplates[0])
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
                n_52_31_STATE.outMessages[0] = message
                n_52_31_STATE.messageTransferFunctions.splice(0, n_52_31_STATE.messageTransferFunctions.length - 1)
                n_52_31_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_31_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_31_STATE.messageTransferFunctions.length; i++) {
                    n_61_17_RCVS_1(n_52_31_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_31", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_61_17_OUTS_0 = 0
function n_61_17_RCVS_1(m) {
                                
                            n_61_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_61_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_52_32_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_52_32_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_52_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_52_32_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_52_32_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_52_32_STATE.outTemplates[0])
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
                n_52_32_STATE.outMessages[0] = message
                n_52_32_STATE.messageTransferFunctions.splice(0, n_52_32_STATE.messageTransferFunctions.length - 1)
                n_52_32_STATE.messageTransferFunctions[0] = function (m) {
                    return n_52_32_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_52_32_STATE.messageTransferFunctions.length; i++) {
                    n_63_17_RCVS_1(n_52_32_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_52_32", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_63_17_OUTS_0 = 0
function n_63_17_RCVS_1(m) {
                                
                            n_63_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_63_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_53_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_53_7_STATE, msg_readFloatToken(m, 0))
                n_53_2_RCVS_1(msg_floats([n_53_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_53_2_RCVS_1(msg_floats([n_53_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_53_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_2_RCVS_0(m) {
                                
        if (!n_53_2_STATE.isClosed) {
            m_n_53_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_53_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_53_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_53_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_53_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_53_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_53_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_53_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_53_8_RCVS_0(msg_floats([n_53_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_53_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_53_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_53_8_STATE.currentValue) {
                    n_53_8_STATE.currentValue = newValue
                    n_53_11_RCVS_0(msg_floats([n_53_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_53_11_RCVS_0(msg_floats([n_53_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_53_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_53_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_11_RCVS_0(m) {
                                
        n_54_0_RCVS_0(msg_bang())
n_53_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_53_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_10_RCVS_0(m) {
                                
        if (!n_53_10_STATE.isClosed) {
            n_53_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_53_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_53_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_53_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_53_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_53_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_53_13_STATE.currentValue) {
                    n_53_13_STATE.currentValue = newValue
                    n_53_9_RCVS_0(msg_floats([n_53_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_53_9_RCVS_0(msg_floats([n_53_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_53_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_53_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_9_RCVS_0(m) {
                                
                if (n_53_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_53_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_53_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_53_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_53_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_53_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_53_9_STATE.stringFilter
                    ) {
                        n_53_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_53_9_STATE.floatFilter
                ) {
                    n_53_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_53_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_3_RCVS_0(m) {
                                
        n_53_5_RCVS_0(msg_bang())
n_52_16_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_53_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_5_RCVS_0(m) {
                                
        n_53_4_RCVS_0(msg_bang())
n_53_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_53_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_53_14_STATE, 
                            () => n_53_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_53_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_53_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_53_14_STATE,
                        () => n_53_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_53_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_53_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_53_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_53_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_53_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_53_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_53_6_STATE.outTemplates[0])
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
                n_53_6_STATE.outMessages[0] = message
                n_53_6_STATE.messageTransferFunctions.splice(0, n_53_6_STATE.messageTransferFunctions.length - 1)
                n_53_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_53_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_53_6_STATE.messageTransferFunctions.length; i++) {
                    n_53_7_RCVS_0(n_53_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_53_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_53_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_53_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_53_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_53_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_53_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_53_4_STATE.outTemplates[0])
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
                n_53_4_STATE.outMessages[0] = message
                n_53_4_STATE.messageTransferFunctions.splice(0, n_53_4_STATE.messageTransferFunctions.length - 1)
                n_53_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_53_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_53_4_STATE.messageTransferFunctions.length; i++) {
                    n_53_7_RCVS_0(n_53_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_53_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_54_0_RCVS_0(m) {
                                
        n_54_6_RCVS_0(msg_bang())
n_54_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_54_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_54_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_54_2_STATE, 
                            () => n_54_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_54_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_54_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_54_2_STATE,
                        () => n_54_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_54_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_54_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_54_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_54_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_54_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_54_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_54_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_54_5_STATE.outTemplates[0])
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
                n_54_5_STATE.outMessages[0] = message
                n_54_5_STATE.messageTransferFunctions.splice(0, n_54_5_STATE.messageTransferFunctions.length - 1)
                n_54_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_54_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_54_5_STATE.messageTransferFunctions.length; i++) {
                    n_54_1_RCVS_0(n_54_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_54_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_54_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_54_1_STATE, msg_readFloatToken(m, 0))
                n_53_10_RCVS_1(msg_floats([n_54_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_53_10_RCVS_1(msg_floats([n_54_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_54_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_54_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_54_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_54_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_54_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_54_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_54_6_STATE.outTemplates[0])
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
                n_54_6_STATE.outMessages[0] = message
                n_54_6_STATE.messageTransferFunctions.splice(0, n_54_6_STATE.messageTransferFunctions.length - 1)
                n_54_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_54_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_54_6_STATE.messageTransferFunctions.length; i++) {
                    n_54_1_RCVS_0(n_54_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_54_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_55_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_55_7_STATE, msg_readFloatToken(m, 0))
                n_55_2_RCVS_1(msg_floats([n_55_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_55_2_RCVS_1(msg_floats([n_55_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_55_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_2_RCVS_0(m) {
                                
        if (!n_55_2_STATE.isClosed) {
            m_n_55_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_55_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_55_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_55_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_55_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_55_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_55_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_55_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_55_8_RCVS_0(msg_floats([n_55_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_55_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_55_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_55_8_STATE.currentValue) {
                    n_55_8_STATE.currentValue = newValue
                    n_55_11_RCVS_0(msg_floats([n_55_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_55_11_RCVS_0(msg_floats([n_55_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_55_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_55_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_11_RCVS_0(m) {
                                
        n_56_0_RCVS_0(msg_bang())
n_55_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_55_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_10_RCVS_0(m) {
                                
        if (!n_55_10_STATE.isClosed) {
            n_55_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_55_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_55_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_55_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_55_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_55_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_55_13_STATE.currentValue) {
                    n_55_13_STATE.currentValue = newValue
                    n_55_9_RCVS_0(msg_floats([n_55_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_55_9_RCVS_0(msg_floats([n_55_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_55_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_55_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_9_RCVS_0(m) {
                                
                if (n_55_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_55_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_55_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_55_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_55_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_55_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_55_9_STATE.stringFilter
                    ) {
                        n_55_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_55_9_STATE.floatFilter
                ) {
                    n_55_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_55_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_3_RCVS_0(m) {
                                
        n_55_5_RCVS_0(msg_bang())
n_52_0_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_55_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_5_RCVS_0(m) {
                                
        n_55_4_RCVS_0(msg_bang())
n_55_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_55_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_55_14_STATE, 
                            () => n_55_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_55_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_55_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_55_14_STATE,
                        () => n_55_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_55_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_55_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_55_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_55_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_55_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_55_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_55_6_STATE.outTemplates[0])
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
                n_55_6_STATE.outMessages[0] = message
                n_55_6_STATE.messageTransferFunctions.splice(0, n_55_6_STATE.messageTransferFunctions.length - 1)
                n_55_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_55_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_55_6_STATE.messageTransferFunctions.length; i++) {
                    n_55_7_RCVS_0(n_55_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_55_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_55_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_55_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_55_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_55_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_55_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_55_4_STATE.outTemplates[0])
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
                n_55_4_STATE.outMessages[0] = message
                n_55_4_STATE.messageTransferFunctions.splice(0, n_55_4_STATE.messageTransferFunctions.length - 1)
                n_55_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_55_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_55_4_STATE.messageTransferFunctions.length; i++) {
                    n_55_7_RCVS_0(n_55_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_55_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_56_0_RCVS_0(m) {
                                
        n_56_6_RCVS_0(msg_bang())
n_56_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_56_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_56_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_56_2_STATE, 
                            () => n_56_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_56_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_56_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_56_2_STATE,
                        () => n_56_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_56_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_56_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_56_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_56_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_56_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_56_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_56_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_56_5_STATE.outTemplates[0])
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
                n_56_5_STATE.outMessages[0] = message
                n_56_5_STATE.messageTransferFunctions.splice(0, n_56_5_STATE.messageTransferFunctions.length - 1)
                n_56_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_56_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_56_5_STATE.messageTransferFunctions.length; i++) {
                    n_56_1_RCVS_0(n_56_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_56_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_56_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_56_1_STATE, msg_readFloatToken(m, 0))
                n_55_10_RCVS_1(msg_floats([n_56_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_55_10_RCVS_1(msg_floats([n_56_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_56_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_56_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_56_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_56_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_56_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_56_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_56_6_STATE.outTemplates[0])
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
                n_56_6_STATE.outMessages[0] = message
                n_56_6_STATE.messageTransferFunctions.splice(0, n_56_6_STATE.messageTransferFunctions.length - 1)
                n_56_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_56_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_56_6_STATE.messageTransferFunctions.length; i++) {
                    n_56_1_RCVS_0(n_56_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_56_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_57_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_57_7_STATE, msg_readFloatToken(m, 0))
                n_57_2_RCVS_1(msg_floats([n_57_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_57_2_RCVS_1(msg_floats([n_57_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_57_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_2_RCVS_0(m) {
                                
        if (!n_57_2_STATE.isClosed) {
            m_n_57_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_57_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_57_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_57_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_57_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_57_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_57_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_57_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_57_8_RCVS_0(msg_floats([n_57_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_57_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_57_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_57_8_STATE.currentValue) {
                    n_57_8_STATE.currentValue = newValue
                    n_57_11_RCVS_0(msg_floats([n_57_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_57_11_RCVS_0(msg_floats([n_57_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_57_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_57_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_11_RCVS_0(m) {
                                
        n_58_0_RCVS_0(msg_bang())
n_57_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_57_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_10_RCVS_0(m) {
                                
        if (!n_57_10_STATE.isClosed) {
            n_57_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_57_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_57_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_57_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_57_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_57_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_57_13_STATE.currentValue) {
                    n_57_13_STATE.currentValue = newValue
                    n_57_9_RCVS_0(msg_floats([n_57_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_57_9_RCVS_0(msg_floats([n_57_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_57_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_57_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_9_RCVS_0(m) {
                                
                if (n_57_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_57_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_57_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_57_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_57_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_57_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_57_9_STATE.stringFilter
                    ) {
                        n_57_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_57_9_STATE.floatFilter
                ) {
                    n_57_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_57_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_3_RCVS_0(m) {
                                
        n_57_5_RCVS_0(msg_bang())
n_52_4_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_57_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_5_RCVS_0(m) {
                                
        n_57_4_RCVS_0(msg_bang())
n_57_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_57_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_57_14_STATE, 
                            () => n_57_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_57_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_57_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_57_14_STATE,
                        () => n_57_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_57_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_57_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_57_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_57_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_57_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_57_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_57_6_STATE.outTemplates[0])
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
                n_57_6_STATE.outMessages[0] = message
                n_57_6_STATE.messageTransferFunctions.splice(0, n_57_6_STATE.messageTransferFunctions.length - 1)
                n_57_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_57_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_57_6_STATE.messageTransferFunctions.length; i++) {
                    n_57_7_RCVS_0(n_57_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_57_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_57_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_57_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_57_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_57_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_57_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_57_4_STATE.outTemplates[0])
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
                n_57_4_STATE.outMessages[0] = message
                n_57_4_STATE.messageTransferFunctions.splice(0, n_57_4_STATE.messageTransferFunctions.length - 1)
                n_57_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_57_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_57_4_STATE.messageTransferFunctions.length; i++) {
                    n_57_7_RCVS_0(n_57_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_57_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_58_0_RCVS_0(m) {
                                
        n_58_6_RCVS_0(msg_bang())
n_58_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_58_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_58_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_58_2_STATE, 
                            () => n_58_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_58_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_58_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_58_2_STATE,
                        () => n_58_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_58_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_58_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_58_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_58_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_58_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_58_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_58_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_58_5_STATE.outTemplates[0])
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
                n_58_5_STATE.outMessages[0] = message
                n_58_5_STATE.messageTransferFunctions.splice(0, n_58_5_STATE.messageTransferFunctions.length - 1)
                n_58_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_58_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_58_5_STATE.messageTransferFunctions.length; i++) {
                    n_58_1_RCVS_0(n_58_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_58_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_58_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_58_1_STATE, msg_readFloatToken(m, 0))
                n_57_10_RCVS_1(msg_floats([n_58_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_57_10_RCVS_1(msg_floats([n_58_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_58_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_58_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_58_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_58_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_58_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_58_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_58_6_STATE.outTemplates[0])
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
                n_58_6_STATE.outMessages[0] = message
                n_58_6_STATE.messageTransferFunctions.splice(0, n_58_6_STATE.messageTransferFunctions.length - 1)
                n_58_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_58_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_58_6_STATE.messageTransferFunctions.length; i++) {
                    n_58_1_RCVS_0(n_58_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_58_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_59_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_59_7_STATE, msg_readFloatToken(m, 0))
                n_59_2_RCVS_1(msg_floats([n_59_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_59_2_RCVS_1(msg_floats([n_59_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_59_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_2_RCVS_0(m) {
                                
        if (!n_59_2_STATE.isClosed) {
            m_n_59_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_59_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_59_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_59_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_59_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_59_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_59_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_59_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_59_8_RCVS_0(msg_floats([n_59_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_59_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_59_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_59_8_STATE.currentValue) {
                    n_59_8_STATE.currentValue = newValue
                    n_59_11_RCVS_0(msg_floats([n_59_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_59_11_RCVS_0(msg_floats([n_59_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_59_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_59_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_11_RCVS_0(m) {
                                
        n_60_0_RCVS_0(msg_bang())
n_59_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_59_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_10_RCVS_0(m) {
                                
        if (!n_59_10_STATE.isClosed) {
            n_59_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_59_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_59_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_59_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_59_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_59_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_59_13_STATE.currentValue) {
                    n_59_13_STATE.currentValue = newValue
                    n_59_9_RCVS_0(msg_floats([n_59_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_59_9_RCVS_0(msg_floats([n_59_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_59_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_59_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_9_RCVS_0(m) {
                                
                if (n_59_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_59_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_59_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_59_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_59_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_59_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_59_9_STATE.stringFilter
                    ) {
                        n_59_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_59_9_STATE.floatFilter
                ) {
                    n_59_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_59_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_3_RCVS_0(m) {
                                
        n_59_5_RCVS_0(msg_bang())
n_52_7_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_59_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_5_RCVS_0(m) {
                                
        n_59_4_RCVS_0(msg_bang())
n_59_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_59_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_59_14_STATE, 
                            () => n_59_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_59_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_59_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_59_14_STATE,
                        () => n_59_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_59_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_59_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_59_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_59_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_59_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_59_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_59_6_STATE.outTemplates[0])
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
                n_59_6_STATE.outMessages[0] = message
                n_59_6_STATE.messageTransferFunctions.splice(0, n_59_6_STATE.messageTransferFunctions.length - 1)
                n_59_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_59_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_59_6_STATE.messageTransferFunctions.length; i++) {
                    n_59_7_RCVS_0(n_59_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_59_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_59_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_59_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_59_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_59_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_59_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_59_4_STATE.outTemplates[0])
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
                n_59_4_STATE.outMessages[0] = message
                n_59_4_STATE.messageTransferFunctions.splice(0, n_59_4_STATE.messageTransferFunctions.length - 1)
                n_59_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_59_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_59_4_STATE.messageTransferFunctions.length; i++) {
                    n_59_7_RCVS_0(n_59_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_59_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_60_0_RCVS_0(m) {
                                
        n_60_6_RCVS_0(msg_bang())
n_60_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_60_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_60_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_60_2_STATE, 
                            () => n_60_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_60_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_60_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_60_2_STATE,
                        () => n_60_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_60_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_60_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_60_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_60_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_60_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_60_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_60_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_60_5_STATE.outTemplates[0])
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
                n_60_5_STATE.outMessages[0] = message
                n_60_5_STATE.messageTransferFunctions.splice(0, n_60_5_STATE.messageTransferFunctions.length - 1)
                n_60_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_60_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_60_5_STATE.messageTransferFunctions.length; i++) {
                    n_60_1_RCVS_0(n_60_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_60_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_60_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_60_1_STATE, msg_readFloatToken(m, 0))
                n_59_10_RCVS_1(msg_floats([n_60_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_59_10_RCVS_1(msg_floats([n_60_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_60_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_60_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_60_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_60_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_60_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_60_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_60_6_STATE.outTemplates[0])
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
                n_60_6_STATE.outMessages[0] = message
                n_60_6_STATE.messageTransferFunctions.splice(0, n_60_6_STATE.messageTransferFunctions.length - 1)
                n_60_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_60_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_60_6_STATE.messageTransferFunctions.length; i++) {
                    n_60_1_RCVS_0(n_60_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_60_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_61_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_61_7_STATE, msg_readFloatToken(m, 0))
                n_61_2_RCVS_1(msg_floats([n_61_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_61_2_RCVS_1(msg_floats([n_61_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_61_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_2_RCVS_0(m) {
                                
        if (!n_61_2_STATE.isClosed) {
            m_n_61_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_61_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_61_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_61_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_61_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_61_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_61_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_61_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_61_8_RCVS_0(msg_floats([n_61_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_61_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_61_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_61_8_STATE.currentValue) {
                    n_61_8_STATE.currentValue = newValue
                    n_61_11_RCVS_0(msg_floats([n_61_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_61_11_RCVS_0(msg_floats([n_61_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_61_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_61_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_11_RCVS_0(m) {
                                
        n_62_0_RCVS_0(msg_bang())
n_61_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_61_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_10_RCVS_0(m) {
                                
        if (!n_61_10_STATE.isClosed) {
            n_61_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_61_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_61_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_61_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_61_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_61_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_61_13_STATE.currentValue) {
                    n_61_13_STATE.currentValue = newValue
                    n_61_9_RCVS_0(msg_floats([n_61_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_61_9_RCVS_0(msg_floats([n_61_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_61_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_61_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_9_RCVS_0(m) {
                                
                if (n_61_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_61_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_61_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_61_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_61_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_61_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_61_9_STATE.stringFilter
                    ) {
                        n_61_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_61_9_STATE.floatFilter
                ) {
                    n_61_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_61_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_3_RCVS_0(m) {
                                
        n_61_5_RCVS_0(msg_bang())
n_52_11_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_61_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_5_RCVS_0(m) {
                                
        n_61_4_RCVS_0(msg_bang())
n_61_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_61_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_61_14_STATE, 
                            () => n_61_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_61_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_61_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_61_14_STATE,
                        () => n_61_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_61_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_61_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_61_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_61_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_61_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_61_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_61_6_STATE.outTemplates[0])
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
                n_61_6_STATE.outMessages[0] = message
                n_61_6_STATE.messageTransferFunctions.splice(0, n_61_6_STATE.messageTransferFunctions.length - 1)
                n_61_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_61_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_61_6_STATE.messageTransferFunctions.length; i++) {
                    n_61_7_RCVS_0(n_61_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_61_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_61_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_61_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_61_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_61_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_61_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_61_4_STATE.outTemplates[0])
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
                n_61_4_STATE.outMessages[0] = message
                n_61_4_STATE.messageTransferFunctions.splice(0, n_61_4_STATE.messageTransferFunctions.length - 1)
                n_61_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_61_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_61_4_STATE.messageTransferFunctions.length; i++) {
                    n_61_7_RCVS_0(n_61_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_61_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_62_0_RCVS_0(m) {
                                
        n_62_6_RCVS_0(msg_bang())
n_62_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_62_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_62_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_62_2_STATE, 
                            () => n_62_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_62_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_62_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_62_2_STATE,
                        () => n_62_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_62_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_62_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_62_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_62_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_62_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_62_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_62_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_62_5_STATE.outTemplates[0])
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
                n_62_5_STATE.outMessages[0] = message
                n_62_5_STATE.messageTransferFunctions.splice(0, n_62_5_STATE.messageTransferFunctions.length - 1)
                n_62_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_62_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_62_5_STATE.messageTransferFunctions.length; i++) {
                    n_62_1_RCVS_0(n_62_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_62_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_62_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_62_1_STATE, msg_readFloatToken(m, 0))
                n_61_10_RCVS_1(msg_floats([n_62_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_61_10_RCVS_1(msg_floats([n_62_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_62_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_62_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_62_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_62_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_62_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_62_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_62_6_STATE.outTemplates[0])
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
                n_62_6_STATE.outMessages[0] = message
                n_62_6_STATE.messageTransferFunctions.splice(0, n_62_6_STATE.messageTransferFunctions.length - 1)
                n_62_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_62_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_62_6_STATE.messageTransferFunctions.length; i++) {
                    n_62_1_RCVS_0(n_62_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_62_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_63_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_63_7_STATE, msg_readFloatToken(m, 0))
                n_63_2_RCVS_1(msg_floats([n_63_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_63_2_RCVS_1(msg_floats([n_63_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_63_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_2_RCVS_0(m) {
                                
        if (!n_63_2_STATE.isClosed) {
            m_n_63_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_63_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_63_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_63_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_63_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_63_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_63_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_63_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_63_8_RCVS_0(msg_floats([n_63_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_63_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_63_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_63_8_STATE.currentValue) {
                    n_63_8_STATE.currentValue = newValue
                    n_63_11_RCVS_0(msg_floats([n_63_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_63_11_RCVS_0(msg_floats([n_63_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_63_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_63_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_11_RCVS_0(m) {
                                
        n_64_0_RCVS_0(msg_bang())
n_63_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_63_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_10_RCVS_0(m) {
                                
        if (!n_63_10_STATE.isClosed) {
            n_63_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_63_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_63_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_63_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_63_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_63_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_63_13_STATE.currentValue) {
                    n_63_13_STATE.currentValue = newValue
                    n_63_9_RCVS_0(msg_floats([n_63_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_63_9_RCVS_0(msg_floats([n_63_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_63_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_63_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_9_RCVS_0(m) {
                                
                if (n_63_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_63_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_63_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_63_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_63_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_63_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_63_9_STATE.stringFilter
                    ) {
                        n_63_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_63_9_STATE.floatFilter
                ) {
                    n_63_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_63_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_3_RCVS_0(m) {
                                
        n_63_5_RCVS_0(msg_bang())
n_52_19_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_63_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_5_RCVS_0(m) {
                                
        n_63_4_RCVS_0(msg_bang())
n_63_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_63_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_63_14_STATE, 
                            () => n_63_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_63_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_63_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_63_14_STATE,
                        () => n_63_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_63_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_63_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_63_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_63_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_63_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_63_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_63_6_STATE.outTemplates[0])
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
                n_63_6_STATE.outMessages[0] = message
                n_63_6_STATE.messageTransferFunctions.splice(0, n_63_6_STATE.messageTransferFunctions.length - 1)
                n_63_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_63_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_63_6_STATE.messageTransferFunctions.length; i++) {
                    n_63_7_RCVS_0(n_63_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_63_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_63_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_63_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_63_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_63_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_63_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_63_4_STATE.outTemplates[0])
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
                n_63_4_STATE.outMessages[0] = message
                n_63_4_STATE.messageTransferFunctions.splice(0, n_63_4_STATE.messageTransferFunctions.length - 1)
                n_63_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_63_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_63_4_STATE.messageTransferFunctions.length; i++) {
                    n_63_7_RCVS_0(n_63_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_63_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_64_0_RCVS_0(m) {
                                
        n_64_6_RCVS_0(msg_bang())
n_64_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_64_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_64_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_64_2_STATE, 
                            () => n_64_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_64_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_64_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_64_2_STATE,
                        () => n_64_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_64_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_64_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_64_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_64_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_64_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_64_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_64_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_64_5_STATE.outTemplates[0])
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
                n_64_5_STATE.outMessages[0] = message
                n_64_5_STATE.messageTransferFunctions.splice(0, n_64_5_STATE.messageTransferFunctions.length - 1)
                n_64_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_64_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_64_5_STATE.messageTransferFunctions.length; i++) {
                    n_64_1_RCVS_0(n_64_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_64_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_64_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_64_1_STATE, msg_readFloatToken(m, 0))
                n_63_10_RCVS_1(msg_floats([n_64_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_63_10_RCVS_1(msg_floats([n_64_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_64_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_64_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_64_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_64_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_64_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_64_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_64_6_STATE.outTemplates[0])
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
                n_64_6_STATE.outMessages[0] = message
                n_64_6_STATE.messageTransferFunctions.splice(0, n_64_6_STATE.messageTransferFunctions.length - 1)
                n_64_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_64_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_64_6_STATE.messageTransferFunctions.length; i++) {
                    n_64_1_RCVS_0(n_64_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_64_6", inlet "0", unsupported message : ' + msg_display(m))
                            }





function n_65_9_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_65_9_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_65_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_16_RCVS_0(m) {
                                
        n_65_17_RCVS_0(msg_bang())
n_65_16_SNDS_1(msg_bang())
n_65_13_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_65_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_13_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_div_setLeft(n_65_13_STATE, msg_readFloatToken(m, 0))
                    n_65_18_RCVS_0(msg_floats([n_65_13_STATE.rightOp !== 0 ? n_65_13_STATE.leftOp / n_65_13_STATE.rightOp: 0]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_65_18_RCVS_0(msg_floats([n_65_13_STATE.rightOp !== 0 ? n_65_13_STATE.leftOp / n_65_13_STATE.rightOp: 0]))
                    return
                }
            
                                throw new Error('[/], id "n_65_13", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_65_13_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_div_setRight(n_65_13_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[/], id "n_65_13", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_65_18_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_65_18_STATE, msg_readFloatToken(m, 0))
                    n_65_19_RCVS_0(msg_floats([n_65_18_STATE.leftOp * n_65_18_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_65_19_RCVS_0(msg_floats([n_65_18_STATE.leftOp * n_65_18_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_65_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_19_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_65_19_STATE, msg_readFloatToken(m, 0))
                    m_n_65_10_0__routemsg_RCVS_0(msg_floats([n_65_19_STATE.leftOp + n_65_19_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    m_n_65_10_0__routemsg_RCVS_0(msg_floats([n_65_19_STATE.leftOp + n_65_19_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_65_19", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_65_10_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_65_10_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_65_10_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_65_10_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_65_10_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_65_10_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_11_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_65_12_RCVS_0(msg_floats([Math.floor(Math.random() * n_65_11_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_65_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_12_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_65_12_STATE, msg_readFloatToken(m, 0))
                    n_65_12_SNDS_0(msg_floats([n_65_12_STATE.leftOp + n_65_12_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_65_12_SNDS_0(msg_floats([n_65_12_STATE.leftOp + n_65_12_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_65_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_14_RCVS_0(m) {
                                
                n_floatatom_receiveMessage(n_65_14_STATE, m)
                return
            
                                throw new Error('[floatatom], id "n_65_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_21_RCVS_0(m) {
                                
            msgBusPublish(n_65_21_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_65_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_17_RCVS_0(m) {
                                
            msgBusPublish(n_65_17_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_65_17", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_20_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_mul_setLeft(n_65_20_STATE, msg_readFloatToken(m, 0))
                    n_65_5_RCVS_0(msg_floats([n_65_20_STATE.leftOp * n_65_20_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_65_5_RCVS_0(msg_floats([n_65_20_STATE.leftOp * n_65_20_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[*], id "n_65_20", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_65_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_65_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_65_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_65_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_65_5_STATE.outTemplates[0])
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
                n_65_5_STATE.outMessages[0] = message
                n_65_5_STATE.messageTransferFunctions.splice(0, n_65_5_STATE.messageTransferFunctions.length - 1)
                n_65_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_65_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_65_5_STATE.messageTransferFunctions.length; i++) {
                    n_65_4_RCVS_0(n_65_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_65_5", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_65_4_OUTS_0 = 0
function n_65_4_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_65_4_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_65_4_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_65_4_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_65_4", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_65_24_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_65_24_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_65_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_65_24_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_65_24_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_65_24_STATE.outTemplates[0])
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
                n_65_24_STATE.outMessages[0] = message
                n_65_24_STATE.messageTransferFunctions.splice(0, n_65_24_STATE.messageTransferFunctions.length - 1)
                n_65_24_STATE.messageTransferFunctions[0] = function (m) {
                    return n_65_24_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_65_24_STATE.messageTransferFunctions.length; i++) {
                    n_66_17_RCVS_1(n_65_24_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_65_24", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_66_17_OUTS_0 = 0
function n_66_17_RCVS_1(m) {
                                
                            n_66_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_66_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_66_7_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_66_7_STATE, msg_readFloatToken(m, 0))
                n_66_2_RCVS_1(msg_floats([n_66_7_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_66_2_RCVS_1(msg_floats([n_66_7_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_66_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_2_RCVS_0(m) {
                                
        if (!n_66_2_STATE.isClosed) {
            m_n_66_1_0__routemsg_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_66_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_66_2_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_66_2_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_66_2", inlet "1", unsupported message : ' + msg_display(m))
                            }

function m_n_66_1_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_66_1_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_66_1_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_1_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_66_8_RCVS_0(msg_floats([n_66_1_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_66_1", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_66_8_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_66_8_STATE.currentValue) {
                    n_66_8_STATE.currentValue = newValue
                    n_66_11_RCVS_0(msg_floats([n_66_8_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_66_11_RCVS_0(msg_floats([n_66_8_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_66_8_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_66_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_11_RCVS_0(m) {
                                
        n_67_0_RCVS_0(msg_bang())
n_66_10_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_66_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_10_RCVS_0(m) {
                                
        if (!n_66_10_STATE.isClosed) {
            n_66_13_RCVS_0(m)
        }
        return
    
                                throw new Error('[spigot], id "n_66_10", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_66_10_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_spigot_setIsClosed(n_66_10_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[spigot], id "n_66_10", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_66_13_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_66_13_STATE.currentValue) {
                    n_66_13_STATE.currentValue = newValue
                    n_66_9_RCVS_0(msg_floats([n_66_13_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_66_9_RCVS_0(msg_floats([n_66_13_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_66_13_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_66_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_9_RCVS_0(m) {
                                
                if (n_66_9_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_66_9_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_66_9_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_66_9_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_66_9_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_66_3_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_66_9_STATE.stringFilter
                    ) {
                        n_66_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_66_9_STATE.floatFilter
                ) {
                    n_66_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_66_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_3_RCVS_0(m) {
                                
        n_66_5_RCVS_0(msg_bang())
m_n_65_8_0__routemsg_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_66_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_65_8_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                SND_TO_NULL(m)
                return
            } else {
                n_65_8_RCVS_0_message(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_65_8_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_65_8_RCVS_0_message(m) {
                                
        if (msg_isBang(m)) {
            n_65_9_RCVS_0(msg_floats([n_65_8_STATE.currentValue]))
            return 
        }
    
                                throw new Error('[snapshot~], id "n_65_8", inlet "0_message", unsupported message : ' + msg_display(m))
                            }

function n_66_5_RCVS_0(m) {
                                
        n_66_4_RCVS_0(msg_bang())
n_66_14_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_66_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_14_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_66_14_STATE, 
                            () => n_66_6_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_66_14_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_66_14_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_66_14_STATE,
                        () => n_66_6_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_66_14_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_66_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_66_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_66_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_66_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_66_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_66_6_STATE.outTemplates[0])
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
                n_66_6_STATE.outMessages[0] = message
                n_66_6_STATE.messageTransferFunctions.splice(0, n_66_6_STATE.messageTransferFunctions.length - 1)
                n_66_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_66_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_66_6_STATE.messageTransferFunctions.length; i++) {
                    n_66_7_RCVS_0(n_66_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_66_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_66_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_66_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_66_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_66_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_66_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_66_4_STATE.outTemplates[0])
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
                n_66_4_STATE.outMessages[0] = message
                n_66_4_STATE.messageTransferFunctions.splice(0, n_66_4_STATE.messageTransferFunctions.length - 1)
                n_66_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_66_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_66_4_STATE.messageTransferFunctions.length; i++) {
                    n_66_7_RCVS_0(n_66_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_66_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_67_0_RCVS_0(m) {
                                
        n_67_6_RCVS_0(msg_bang())
n_67_2_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_67_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_67_2_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_67_2_STATE, 
                            () => n_67_5_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_67_2_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_67_2_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_67_2_STATE,
                        () => n_67_5_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_67_2_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_67_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_67_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_67_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_67_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_67_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_67_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_67_5_STATE.outTemplates[0])
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
                n_67_5_STATE.outMessages[0] = message
                n_67_5_STATE.messageTransferFunctions.splice(0, n_67_5_STATE.messageTransferFunctions.length - 1)
                n_67_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_67_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_67_5_STATE.messageTransferFunctions.length; i++) {
                    n_67_1_RCVS_0(n_67_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_67_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_67_1_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueInt(n_67_1_STATE, msg_readFloatToken(m, 0))
                n_66_10_RCVS_1(msg_floats([n_67_1_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_66_10_RCVS_1(msg_floats([n_67_1_STATE.value]))
                return
                
            }
        
                                throw new Error('[int], id "n_67_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_67_6_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_67_6_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_67_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_67_6_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_67_6_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_67_6_STATE.outTemplates[0])
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
                n_67_6_STATE.outMessages[0] = message
                n_67_6_STATE.messageTransferFunctions.splice(0, n_67_6_STATE.messageTransferFunctions.length - 1)
                n_67_6_STATE.messageTransferFunctions[0] = function (m) {
                    return n_67_6_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_67_6_STATE.messageTransferFunctions.length; i++) {
                    n_67_1_RCVS_0(n_67_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_67_6", inlet "0", unsupported message : ' + msg_display(m))
                            }






let n_0_6_OUTS_0 = 0











let n_0_7_OUTS_0 = 0













let n_1_4_OUTS_0 = 0













let n_0_57_OUTS_0 = 0







let n_0_21_OUTS_0 = 0











let n_0_43_OUTS_0 = 0













let n_3_3_OUTS_0 = 0













let n_0_59_OUTS_0 = 0





let n_0_23_OUTS_0 = 0











let n_0_22_OUTS_0 = 0













let n_5_2_OUTS_0 = 0













let n_0_61_OUTS_0 = 0





let n_0_24_OUTS_0 = 0











let n_0_25_OUTS_0 = 0













let n_7_2_OUTS_0 = 0













let n_0_63_OUTS_0 = 0











let n_13_15_OUTS_0 = 0

let n_13_14_OUTS_0 = 0





let n_52_15_OUTS_0 = 0

let n_52_14_OUTS_0 = 0





let n_39_15_OUTS_0 = 0

let n_39_14_OUTS_0 = 0





let n_26_15_OUTS_0 = 0

let n_26_14_OUTS_0 = 0





let n_65_15_OUTS_0 = 0



let n_65_6_OUTS_0 = 0





let n_65_2_OUTS_0 = 0



let n_65_10_OUTS_0 = 0

let n_65_7_OUTS_0 = 0




































function n_13_36_SNDS_0(m) {
                    n_13_8_RCVS_0(m)
n_13_10_RCVS_0(m)
                }























function n_13_26_SNDS_0(m) {
                    n_13_27_RCVS_0(m)
n_13_28_RCVS_0(m)
n_13_29_RCVS_0(m)
n_13_30_RCVS_0(m)
n_13_31_RCVS_0(m)
n_13_32_RCVS_0(m)
                }





















































































































































function n_26_36_SNDS_0(m) {
                    n_26_8_RCVS_0(m)
n_26_10_RCVS_0(m)
                }























function n_26_26_SNDS_0(m) {
                    n_26_27_RCVS_0(m)
n_26_28_RCVS_0(m)
n_26_29_RCVS_0(m)
n_26_30_RCVS_0(m)
n_26_31_RCVS_0(m)
n_26_32_RCVS_0(m)
                }





















































































































































function n_39_36_SNDS_0(m) {
                    n_39_8_RCVS_0(m)
n_39_10_RCVS_0(m)
                }























function n_39_26_SNDS_0(m) {
                    n_39_27_RCVS_0(m)
n_39_28_RCVS_0(m)
n_39_29_RCVS_0(m)
n_39_30_RCVS_0(m)
n_39_31_RCVS_0(m)
n_39_32_RCVS_0(m)
                }





















































































































































function n_52_36_SNDS_0(m) {
                    n_52_8_RCVS_0(m)
n_52_10_RCVS_0(m)
                }























function n_52_26_SNDS_0(m) {
                    n_52_27_RCVS_0(m)
n_52_28_RCVS_0(m)
n_52_29_RCVS_0(m)
n_52_30_RCVS_0(m)
n_52_31_RCVS_0(m)
n_52_32_RCVS_0(m)
                }










































































































































function n_65_9_SNDS_0(m) {
                    n_65_16_RCVS_0(m)
n_65_20_RCVS_0(m)
                }
function n_65_16_SNDS_1(m) {
                    n_65_11_RCVS_0(m)
n_65_21_RCVS_0(m)
                }






function n_65_12_SNDS_0(m) {
                    n_65_13_RCVS_1(m)
n_65_14_RCVS_0(m)
                }































































































































































        

        
        

        
                const n_2_1_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 1,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_2_1_STATE.messageReceiver = function (m) {
                        n_tgl_receiveMessage(n_2_1_STATE, m)
                    }
                    n_2_1_STATE.messageSender = n_2_2_RCVS_0
                    n_control_setReceiveBusName(n_2_1_STATE, "empty")
                })
    
                commons_waitFrame(0, () => n_2_2_RCVS_0(msg_floats([n_2_1_STATE.valueFloat])))
            

        const n_2_2_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: m_n_2_3_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_2_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_2_2_STATE, 100)
            n_2_2_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_2_2_STATE)
            }
        })
    


        const n_2_3_STATE = {
            currentValue: 0
        }
    

                const n_4_1_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 1,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_4_1_STATE.messageReceiver = function (m) {
                        n_tgl_receiveMessage(n_4_1_STATE, m)
                    }
                    n_4_1_STATE.messageSender = n_4_2_RCVS_0
                    n_control_setReceiveBusName(n_4_1_STATE, "empty")
                })
    
                commons_waitFrame(0, () => n_4_2_RCVS_0(msg_floats([n_4_1_STATE.valueFloat])))
            

        const n_4_2_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: m_n_4_3_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_4_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_4_2_STATE, 100)
            n_4_2_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_4_2_STATE)
            }
        })
    


        const n_4_3_STATE = {
            currentValue: 0
        }
    

                const n_6_1_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 1,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_6_1_STATE.messageReceiver = function (m) {
                        n_tgl_receiveMessage(n_6_1_STATE, m)
                    }
                    n_6_1_STATE.messageSender = n_6_2_RCVS_0
                    n_control_setReceiveBusName(n_6_1_STATE, "empty")
                })
    
                commons_waitFrame(0, () => n_6_2_RCVS_0(msg_floats([n_6_1_STATE.valueFloat])))
            

        const n_6_2_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: m_n_6_3_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_6_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_6_2_STATE, 100)
            n_6_2_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_6_2_STATE)
            }
        })
    


        const n_6_3_STATE = {
            currentValue: 0
        }
    

                const n_8_1_STATE = {
                    minValue: 0,
                    maxValue: 1,
                    valueFloat: 1,
                    value: msg_create([]),
                    receiveBusName: "empty",
                    sendBusName: "empty",
                    messageReceiver: n_control_defaultMessageHandler,
                    messageSender: n_control_defaultMessageHandler,
                }
    
                commons_waitEngineConfigure(() => {
                    n_8_1_STATE.messageReceiver = function (m) {
                        n_tgl_receiveMessage(n_8_1_STATE, m)
                    }
                    n_8_1_STATE.messageSender = n_8_2_RCVS_0
                    n_control_setReceiveBusName(n_8_1_STATE, "empty")
                })
    
                commons_waitFrame(0, () => n_8_2_RCVS_0(msg_floats([n_8_1_STATE.valueFloat])))
            

        const n_8_2_STATE = {
            rate: 0,
            sampleRatio: 1,
            skedId: SKED_ID_NULL,
            realNextTick: -1,
            snd0: m_n_8_3_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_8_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_metro_setRate(n_8_2_STATE, 100)
            n_8_2_STATE.tickCallback = function () {
                n_metro_scheduleNextTick(n_8_2_STATE)
            }
        })
    


        const n_8_3_STATE = {
            currentValue: 0
        }
    

        const n_13_0_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_0_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_0_STATE, m)
            }
            n_13_0_STATE.messageSender = n_13_34_RCVS_0
            n_control_setReceiveBusName(n_13_0_STATE, "empty")
        })

        
    

        const n_13_34_STATE = {
            maxValue: 8
        }
    

        const n_13_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_13_2_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_2_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_2_STATE, m)
            }
            n_13_2_STATE.messageSender = n_9_0_RCVS_0
            n_control_setReceiveBusName(n_13_2_STATE, "empty")
        })

        
    

            const n_9_0_STATE = {
                busName: "grainSizeSeq_1",
            }
        

        const n_13_4_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_4_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_4_STATE, m)
            }
            n_13_4_STATE.messageSender = n_13_35_RCVS_0
            n_control_setReceiveBusName(n_13_4_STATE, "empty")
        })

        
    

        const n_13_35_STATE = {
            maxValue: 6
        }
    

        const n_13_5_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_13_6_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_6_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_6_STATE, m)
            }
            n_13_6_STATE.messageSender = n_9_1_RCVS_0
            n_control_setReceiveBusName(n_13_6_STATE, "empty")
        })

        
    

            const n_9_1_STATE = {
                busName: "pitchSeq_1",
            }
        

        const n_13_7_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_7_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_7_STATE, m)
            }
            n_13_7_STATE.messageSender = n_13_36_RCVS_0
            n_control_setReceiveBusName(n_13_7_STATE, "empty")
        })

        
    

        const n_13_36_STATE = {
            maxValue: 6
        }
    

        const n_13_8_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_13_9_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_9_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_9_STATE, m)
            }
            n_13_9_STATE.messageSender = n_9_2_RCVS_0
            n_control_setReceiveBusName(n_13_9_STATE, "empty")
        })

        
    

            const n_9_2_STATE = {
                busName: "modPosSeq_1",
            }
        

            const n_13_10_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_13_10_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_13_10_STATE, m)
                }
                n_13_10_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_13_10_STATE, "empty")
            })
        

        const n_13_11_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_11_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_11_STATE, m)
            }
            n_13_11_STATE.messageSender = n_13_37_RCVS_0
            n_control_setReceiveBusName(n_13_11_STATE, "empty")
        })

        
    

        const n_13_37_STATE = {
            maxValue: 2
        }
    

        const n_13_12_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_13_13_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_13_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_13_STATE, m)
            }
            n_13_13_STATE.messageSender = n_9_3_RCVS_0
            n_control_setReceiveBusName(n_13_13_STATE, "empty")
        })

        
    

            const n_9_3_STATE = {
                busName: "fwdAmtSeq_1",
            }
        

        const n_13_16_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_16_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_16_STATE, m)
            }
            n_13_16_STATE.messageSender = n_13_33_RCVS_0
            n_control_setReceiveBusName(n_13_16_STATE, "empty")
        })

        
    

        const n_13_33_STATE = {
            maxValue: 8
        }
    

        const n_13_17_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_13_18_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_18_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_18_STATE, m)
            }
            n_13_18_STATE.messageSender = n_9_5_RCVS_0
            n_control_setReceiveBusName(n_13_18_STATE, "empty")
        })

        
    

            const n_9_5_STATE = {
                busName: "randDel1",
            }
        

        const n_13_19_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_13_19_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_13_19_STATE, m)
            }
            n_13_19_STATE.messageSender = n_13_38_RCVS_0
            n_control_setReceiveBusName(n_13_19_STATE, "empty")
        })

        
    

        const n_13_38_STATE = {
            maxValue: 12
        }
    

        const n_13_20_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_13_21_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_21_STATE.outTemplates[0] = []
            
                n_13_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_21_STATE.outMessages[0] = msg_create(n_13_21_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_21_STATE.outMessages[0], 0, 0)
            
        
        
        n_13_21_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_21_STATE.outMessages[0]
                }
,
        ]
    

            const n_9_6_STATE = {
                busName: "positionOffset_1",
            }
        

        const n_13_22_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_22_STATE.outTemplates[0] = []
            
                n_13_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_22_STATE.outMessages[0] = msg_create(n_13_22_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_22_STATE.outMessages[0], 0, 0.25)
            
        
        
        n_13_22_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_22_STATE.outMessages[0]
                }
,
        ]
    

        const n_13_23_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_23_STATE.outTemplates[0] = []
            
                n_13_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_23_STATE.outMessages[0] = msg_create(n_13_23_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_23_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_13_23_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_23_STATE.outMessages[0]
                }
,
        ]
    

        const n_13_24_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_24_STATE.outTemplates[0] = []
            
                n_13_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_24_STATE.outMessages[0] = msg_create(n_13_24_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_24_STATE.outMessages[0], 0, 0.75)
            
        
        
        n_13_24_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_24_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("startBang", n_13_21_RCVS_0)
            })
        
commons_waitFrame(0, () => n_13_26_SNDS_0(msg_bang()))

        const n_13_27_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_27_STATE.outTemplates[0] = []
            
                n_13_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_27_STATE.outMessages[0] = msg_create(n_13_27_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_27_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_13_27_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_27_STATE.outMessages[0]
                }
,
        ]
    

        const n_14_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_14_17_STATE.floatInputs.set(1, 0)
        
    

        const n_13_28_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_28_STATE.outTemplates[0] = []
            
                n_13_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_28_STATE.outMessages[0] = msg_create(n_13_28_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_28_STATE.outMessages[0], 0, 0.9)
            
        
        
        n_13_28_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_28_STATE.outMessages[0]
                }
,
        ]
    

        const n_16_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_16_17_STATE.floatInputs.set(1, 0)
        
    

        const n_13_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_29_STATE.outTemplates[0] = []
            
                n_13_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_29_STATE.outMessages[0] = msg_create(n_13_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_29_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_13_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_29_STATE.outMessages[0]
                }
,
        ]
    

        const n_18_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_18_17_STATE.floatInputs.set(1, 0)
        
    

        const n_13_30_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_30_STATE.outTemplates[0] = []
            
                n_13_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_30_STATE.outMessages[0] = msg_create(n_13_30_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_30_STATE.outMessages[0], 0, 0.2)
            
        
        
        n_13_30_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_30_STATE.outMessages[0]
                }
,
        ]
    

        const n_20_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_20_17_STATE.floatInputs.set(1, 0)
        
    

        const n_13_31_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_31_STATE.outTemplates[0] = []
            
                n_13_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_31_STATE.outMessages[0] = msg_create(n_13_31_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_31_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_13_31_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_31_STATE.outMessages[0]
                }
,
        ]
    

        const n_22_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_22_17_STATE.floatInputs.set(1, 0)
        
    

        const n_13_32_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_13_32_STATE.outTemplates[0] = []
            
                n_13_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_13_32_STATE.outMessages[0] = msg_create(n_13_32_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_13_32_STATE.outMessages[0], 0, 0.4)
            
        
        
        n_13_32_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_13_32_STATE.outMessages[0]
                }
,
        ]
    

        const n_24_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_24_17_STATE.floatInputs.set(1, 0)
        
    

            const n_14_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_14_7_STATE, 0)
        

        const n_14_2_STATE = {
            isClosed: true
        }
    


        const n_14_1_STATE = {
            currentValue: 0
        }
    

            const n_14_8_STATE = {
                currentValue: 0
            }
        


        const n_14_10_STATE = {
            isClosed: true
        }
    

            const n_14_13_STATE = {
                currentValue: 0
            }
        

        const n_14_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_14_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_14_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_14_14_STATE, 1200)
        })
    

        const n_14_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_14_6_STATE.outTemplates[0] = []
            
                n_14_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_14_6_STATE.outMessages[0] = msg_create(n_14_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_14_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_14_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_14_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_14_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_14_4_STATE.outTemplates[0] = []
            
                n_14_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_14_4_STATE.outMessages[0] = msg_create(n_14_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_14_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_14_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_14_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_15_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_15_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_15_2_STATE, 1000)
        })
    

        const n_15_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_15_5_STATE.outTemplates[0] = []
            
                n_15_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_15_5_STATE.outMessages[0] = msg_create(n_15_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_15_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_15_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_15_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_15_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_15_1_STATE, 0)
        

        const n_15_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_15_6_STATE.outTemplates[0] = []
            
                n_15_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_15_6_STATE.outMessages[0] = msg_create(n_15_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_15_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_15_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_15_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_14_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_14_6_RCVS_0(msg_bang()))

            const n_16_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_16_7_STATE, 0)
        

        const n_16_2_STATE = {
            isClosed: true
        }
    


        const n_16_1_STATE = {
            currentValue: 0
        }
    

            const n_16_8_STATE = {
                currentValue: 0
            }
        


        const n_16_10_STATE = {
            isClosed: true
        }
    

            const n_16_13_STATE = {
                currentValue: 0
            }
        

        const n_16_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_16_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_16_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_16_14_STATE, 1200)
        })
    

        const n_16_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_16_6_STATE.outTemplates[0] = []
            
                n_16_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_16_6_STATE.outMessages[0] = msg_create(n_16_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_16_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_16_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_16_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_16_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_16_4_STATE.outTemplates[0] = []
            
                n_16_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_16_4_STATE.outMessages[0] = msg_create(n_16_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_16_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_16_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_16_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_17_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_17_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_17_2_STATE, 1000)
        })
    

        const n_17_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_17_5_STATE.outTemplates[0] = []
            
                n_17_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_17_5_STATE.outMessages[0] = msg_create(n_17_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_17_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_17_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_17_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_17_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_17_1_STATE, 0)
        

        const n_17_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_17_6_STATE.outTemplates[0] = []
            
                n_17_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_17_6_STATE.outMessages[0] = msg_create(n_17_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_17_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_17_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_17_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_16_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_16_6_RCVS_0(msg_bang()))

            const n_18_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_18_7_STATE, 0)
        

        const n_18_2_STATE = {
            isClosed: true
        }
    


        const n_18_1_STATE = {
            currentValue: 0
        }
    

            const n_18_8_STATE = {
                currentValue: 0
            }
        


        const n_18_10_STATE = {
            isClosed: true
        }
    

            const n_18_13_STATE = {
                currentValue: 0
            }
        

        const n_18_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_18_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_18_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_18_14_STATE, 1200)
        })
    

        const n_18_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_18_6_STATE.outTemplates[0] = []
            
                n_18_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_18_6_STATE.outMessages[0] = msg_create(n_18_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_18_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_18_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_18_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_18_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_18_4_STATE.outTemplates[0] = []
            
                n_18_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_18_4_STATE.outMessages[0] = msg_create(n_18_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_18_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_18_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_18_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_19_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_19_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_19_2_STATE, 1000)
        })
    

        const n_19_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_19_5_STATE.outTemplates[0] = []
            
                n_19_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_19_5_STATE.outMessages[0] = msg_create(n_19_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_19_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_19_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_19_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_19_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_19_1_STATE, 0)
        

        const n_19_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_19_6_STATE.outTemplates[0] = []
            
                n_19_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_19_6_STATE.outMessages[0] = msg_create(n_19_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_19_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_19_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_19_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_18_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_18_6_RCVS_0(msg_bang()))

            const n_20_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_20_7_STATE, 0)
        

        const n_20_2_STATE = {
            isClosed: true
        }
    


        const n_20_1_STATE = {
            currentValue: 0
        }
    

            const n_20_8_STATE = {
                currentValue: 0
            }
        


        const n_20_10_STATE = {
            isClosed: true
        }
    

            const n_20_13_STATE = {
                currentValue: 0
            }
        

        const n_20_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_20_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_20_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_20_14_STATE, 1200)
        })
    

        const n_20_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_20_6_STATE.outTemplates[0] = []
            
                n_20_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_20_6_STATE.outMessages[0] = msg_create(n_20_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_20_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_20_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_20_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_20_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_20_4_STATE.outTemplates[0] = []
            
                n_20_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_20_4_STATE.outMessages[0] = msg_create(n_20_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_20_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_20_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_20_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_21_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_21_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_21_2_STATE, 1000)
        })
    

        const n_21_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_21_5_STATE.outTemplates[0] = []
            
                n_21_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_21_5_STATE.outMessages[0] = msg_create(n_21_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_21_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_21_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_21_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_21_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_21_1_STATE, 0)
        

        const n_21_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_21_6_STATE.outTemplates[0] = []
            
                n_21_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_21_6_STATE.outMessages[0] = msg_create(n_21_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_21_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_21_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_21_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_20_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_20_6_RCVS_0(msg_bang()))

            const n_22_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_22_7_STATE, 0)
        

        const n_22_2_STATE = {
            isClosed: true
        }
    


        const n_22_1_STATE = {
            currentValue: 0
        }
    

            const n_22_8_STATE = {
                currentValue: 0
            }
        


        const n_22_10_STATE = {
            isClosed: true
        }
    

            const n_22_13_STATE = {
                currentValue: 0
            }
        

        const n_22_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_22_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_22_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_22_14_STATE, 1200)
        })
    

        const n_22_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_22_6_STATE.outTemplates[0] = []
            
                n_22_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_22_6_STATE.outMessages[0] = msg_create(n_22_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_22_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_22_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_22_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_22_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_22_4_STATE.outTemplates[0] = []
            
                n_22_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_22_4_STATE.outMessages[0] = msg_create(n_22_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_22_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_22_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_22_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_23_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_23_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_23_2_STATE, 1000)
        })
    

        const n_23_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_23_5_STATE.outTemplates[0] = []
            
                n_23_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_23_5_STATE.outMessages[0] = msg_create(n_23_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_23_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_23_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_23_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_23_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_23_1_STATE, 0)
        

        const n_23_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_23_6_STATE.outTemplates[0] = []
            
                n_23_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_23_6_STATE.outMessages[0] = msg_create(n_23_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_23_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_23_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_23_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_22_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_22_6_RCVS_0(msg_bang()))

            const n_24_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_24_7_STATE, 0)
        

        const n_24_2_STATE = {
            isClosed: true
        }
    


        const n_24_1_STATE = {
            currentValue: 0
        }
    

            const n_24_8_STATE = {
                currentValue: 0
            }
        


        const n_24_10_STATE = {
            isClosed: true
        }
    

            const n_24_13_STATE = {
                currentValue: 0
            }
        

        const n_24_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_24_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_24_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_24_14_STATE, 1200)
        })
    

        const n_24_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_24_6_STATE.outTemplates[0] = []
            
                n_24_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_24_6_STATE.outMessages[0] = msg_create(n_24_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_24_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_24_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_24_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_24_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_24_4_STATE.outTemplates[0] = []
            
                n_24_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_24_4_STATE.outMessages[0] = msg_create(n_24_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_24_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_24_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_24_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_25_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_25_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_25_2_STATE, 1000)
        })
    

        const n_25_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_25_5_STATE.outTemplates[0] = []
            
                n_25_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_25_5_STATE.outMessages[0] = msg_create(n_25_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_25_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_25_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_25_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_25_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_25_1_STATE, 0)
        

        const n_25_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_25_6_STATE.outTemplates[0] = []
            
                n_25_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_25_6_STATE.outMessages[0] = msg_create(n_25_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_25_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_25_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_25_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_24_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_24_6_RCVS_0(msg_bang()))

        const n_26_0_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_0_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_0_STATE, m)
            }
            n_26_0_STATE.messageSender = n_26_34_RCVS_0
            n_control_setReceiveBusName(n_26_0_STATE, "empty")
        })

        
    

        const n_26_34_STATE = {
            maxValue: 8
        }
    

        const n_26_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_26_2_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_2_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_2_STATE, m)
            }
            n_26_2_STATE.messageSender = n_12_12_RCVS_0
            n_control_setReceiveBusName(n_26_2_STATE, "empty")
        })

        
    

            const n_12_12_STATE = {
                busName: "grainSizeSeq_2",
            }
        

        const n_26_4_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_4_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_4_STATE, m)
            }
            n_26_4_STATE.messageSender = n_26_35_RCVS_0
            n_control_setReceiveBusName(n_26_4_STATE, "empty")
        })

        
    

        const n_26_35_STATE = {
            maxValue: 6
        }
    

        const n_26_5_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_26_6_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_6_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_6_STATE, m)
            }
            n_26_6_STATE.messageSender = n_12_11_RCVS_0
            n_control_setReceiveBusName(n_26_6_STATE, "empty")
        })

        
    

            const n_12_11_STATE = {
                busName: "pitchSeq_2",
            }
        

        const n_26_7_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_7_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_7_STATE, m)
            }
            n_26_7_STATE.messageSender = n_26_36_RCVS_0
            n_control_setReceiveBusName(n_26_7_STATE, "empty")
        })

        
    

        const n_26_36_STATE = {
            maxValue: 6
        }
    

        const n_26_8_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_26_9_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_9_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_9_STATE, m)
            }
            n_26_9_STATE.messageSender = n_12_10_RCVS_0
            n_control_setReceiveBusName(n_26_9_STATE, "empty")
        })

        
    

            const n_12_10_STATE = {
                busName: "modPosSeq_2",
            }
        

            const n_26_10_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_26_10_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_26_10_STATE, m)
                }
                n_26_10_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_26_10_STATE, "empty")
            })
        

        const n_26_11_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_11_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_11_STATE, m)
            }
            n_26_11_STATE.messageSender = n_26_37_RCVS_0
            n_control_setReceiveBusName(n_26_11_STATE, "empty")
        })

        
    

        const n_26_37_STATE = {
            maxValue: 2
        }
    

        const n_26_12_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_26_13_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_13_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_13_STATE, m)
            }
            n_26_13_STATE.messageSender = n_12_9_RCVS_0
            n_control_setReceiveBusName(n_26_13_STATE, "empty")
        })

        
    

            const n_12_9_STATE = {
                busName: "fwdAmtSeq_2",
            }
        

        const n_26_16_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_16_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_16_STATE, m)
            }
            n_26_16_STATE.messageSender = n_26_33_RCVS_0
            n_control_setReceiveBusName(n_26_16_STATE, "empty")
        })

        
    

        const n_26_33_STATE = {
            maxValue: 8
        }
    

        const n_26_17_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_26_18_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_18_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_18_STATE, m)
            }
            n_26_18_STATE.messageSender = n_12_13_RCVS_0
            n_control_setReceiveBusName(n_26_18_STATE, "empty")
        })

        
    

            const n_12_13_STATE = {
                busName: "randDel2",
            }
        

        const n_26_19_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_26_19_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_26_19_STATE, m)
            }
            n_26_19_STATE.messageSender = n_26_38_RCVS_0
            n_control_setReceiveBusName(n_26_19_STATE, "empty")
        })

        
    

        const n_26_38_STATE = {
            maxValue: 12
        }
    

        const n_26_20_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_26_21_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_21_STATE.outTemplates[0] = []
            
                n_26_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_21_STATE.outMessages[0] = msg_create(n_26_21_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_21_STATE.outMessages[0], 0, 0)
            
        
        
        n_26_21_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_21_STATE.outMessages[0]
                }
,
        ]
    

            const n_12_8_STATE = {
                busName: "positionOffset_2",
            }
        

        const n_26_22_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_22_STATE.outTemplates[0] = []
            
                n_26_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_22_STATE.outMessages[0] = msg_create(n_26_22_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_22_STATE.outMessages[0], 0, 0.25)
            
        
        
        n_26_22_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_22_STATE.outMessages[0]
                }
,
        ]
    

        const n_26_23_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_23_STATE.outTemplates[0] = []
            
                n_26_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_23_STATE.outMessages[0] = msg_create(n_26_23_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_23_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_26_23_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_23_STATE.outMessages[0]
                }
,
        ]
    

        const n_26_24_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_24_STATE.outTemplates[0] = []
            
                n_26_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_24_STATE.outMessages[0] = msg_create(n_26_24_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_24_STATE.outMessages[0], 0, 0.75)
            
        
        
        n_26_24_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_24_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("startBang", n_26_21_RCVS_0)
            })
        
commons_waitFrame(0, () => n_26_26_SNDS_0(msg_bang()))

        const n_26_27_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_27_STATE.outTemplates[0] = []
            
                n_26_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_27_STATE.outMessages[0] = msg_create(n_26_27_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_27_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_26_27_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_27_STATE.outMessages[0]
                }
,
        ]
    

        const n_27_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_27_17_STATE.floatInputs.set(1, 0)
        
    

        const n_26_28_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_28_STATE.outTemplates[0] = []
            
                n_26_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_28_STATE.outMessages[0] = msg_create(n_26_28_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_28_STATE.outMessages[0], 0, 0.9)
            
        
        
        n_26_28_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_28_STATE.outMessages[0]
                }
,
        ]
    

        const n_29_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_29_17_STATE.floatInputs.set(1, 0)
        
    

        const n_26_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_29_STATE.outTemplates[0] = []
            
                n_26_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_29_STATE.outMessages[0] = msg_create(n_26_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_29_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_26_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_29_STATE.outMessages[0]
                }
,
        ]
    

        const n_31_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_31_17_STATE.floatInputs.set(1, 0)
        
    

        const n_26_30_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_30_STATE.outTemplates[0] = []
            
                n_26_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_30_STATE.outMessages[0] = msg_create(n_26_30_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_30_STATE.outMessages[0], 0, 0.2)
            
        
        
        n_26_30_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_30_STATE.outMessages[0]
                }
,
        ]
    

        const n_33_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_33_17_STATE.floatInputs.set(1, 0)
        
    

        const n_26_31_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_31_STATE.outTemplates[0] = []
            
                n_26_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_31_STATE.outMessages[0] = msg_create(n_26_31_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_31_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_26_31_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_31_STATE.outMessages[0]
                }
,
        ]
    

        const n_35_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_35_17_STATE.floatInputs.set(1, 0)
        
    

        const n_26_32_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_26_32_STATE.outTemplates[0] = []
            
                n_26_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_26_32_STATE.outMessages[0] = msg_create(n_26_32_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_26_32_STATE.outMessages[0], 0, 0.4)
            
        
        
        n_26_32_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_26_32_STATE.outMessages[0]
                }
,
        ]
    

        const n_37_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_37_17_STATE.floatInputs.set(1, 0)
        
    

            const n_27_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_27_7_STATE, 0)
        

        const n_27_2_STATE = {
            isClosed: true
        }
    


        const n_27_1_STATE = {
            currentValue: 0
        }
    

            const n_27_8_STATE = {
                currentValue: 0
            }
        


        const n_27_10_STATE = {
            isClosed: true
        }
    

            const n_27_13_STATE = {
                currentValue: 0
            }
        

        const n_27_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_27_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_27_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_27_14_STATE, 1200)
        })
    

        const n_27_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_27_6_STATE.outTemplates[0] = []
            
                n_27_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_27_6_STATE.outMessages[0] = msg_create(n_27_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_27_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_27_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_27_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_27_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_27_4_STATE.outTemplates[0] = []
            
                n_27_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_27_4_STATE.outMessages[0] = msg_create(n_27_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_27_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_27_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_27_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_28_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_28_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_28_2_STATE, 1000)
        })
    

        const n_28_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_28_5_STATE.outTemplates[0] = []
            
                n_28_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_28_5_STATE.outMessages[0] = msg_create(n_28_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_28_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_28_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_28_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_28_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_28_1_STATE, 0)
        

        const n_28_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_28_6_STATE.outTemplates[0] = []
            
                n_28_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_28_6_STATE.outMessages[0] = msg_create(n_28_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_28_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_28_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_28_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_27_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_27_6_RCVS_0(msg_bang()))

            const n_29_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_29_7_STATE, 0)
        

        const n_29_2_STATE = {
            isClosed: true
        }
    


        const n_29_1_STATE = {
            currentValue: 0
        }
    

            const n_29_8_STATE = {
                currentValue: 0
            }
        


        const n_29_10_STATE = {
            isClosed: true
        }
    

            const n_29_13_STATE = {
                currentValue: 0
            }
        

        const n_29_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_29_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_29_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_29_14_STATE, 1200)
        })
    

        const n_29_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_29_6_STATE.outTemplates[0] = []
            
                n_29_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_29_6_STATE.outMessages[0] = msg_create(n_29_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_29_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_29_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_29_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_29_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_29_4_STATE.outTemplates[0] = []
            
                n_29_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_29_4_STATE.outMessages[0] = msg_create(n_29_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_29_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_29_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_29_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_30_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_30_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_30_2_STATE, 1000)
        })
    

        const n_30_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_30_5_STATE.outTemplates[0] = []
            
                n_30_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_30_5_STATE.outMessages[0] = msg_create(n_30_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_30_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_30_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_30_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_30_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_30_1_STATE, 0)
        

        const n_30_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_30_6_STATE.outTemplates[0] = []
            
                n_30_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_30_6_STATE.outMessages[0] = msg_create(n_30_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_30_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_30_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_30_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_29_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_29_6_RCVS_0(msg_bang()))

            const n_31_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_31_7_STATE, 0)
        

        const n_31_2_STATE = {
            isClosed: true
        }
    


        const n_31_1_STATE = {
            currentValue: 0
        }
    

            const n_31_8_STATE = {
                currentValue: 0
            }
        


        const n_31_10_STATE = {
            isClosed: true
        }
    

            const n_31_13_STATE = {
                currentValue: 0
            }
        

        const n_31_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_31_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_31_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_31_14_STATE, 1200)
        })
    

        const n_31_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_31_6_STATE.outTemplates[0] = []
            
                n_31_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_31_6_STATE.outMessages[0] = msg_create(n_31_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_31_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_31_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_31_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_31_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_31_4_STATE.outTemplates[0] = []
            
                n_31_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_31_4_STATE.outMessages[0] = msg_create(n_31_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_31_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_31_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_31_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_32_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_32_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_32_2_STATE, 1000)
        })
    

        const n_32_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_32_5_STATE.outTemplates[0] = []
            
                n_32_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_32_5_STATE.outMessages[0] = msg_create(n_32_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_32_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_32_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_32_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_32_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_32_1_STATE, 0)
        

        const n_32_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_32_6_STATE.outTemplates[0] = []
            
                n_32_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_32_6_STATE.outMessages[0] = msg_create(n_32_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_32_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_32_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_32_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_31_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_31_6_RCVS_0(msg_bang()))

            const n_33_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_33_7_STATE, 0)
        

        const n_33_2_STATE = {
            isClosed: true
        }
    


        const n_33_1_STATE = {
            currentValue: 0
        }
    

            const n_33_8_STATE = {
                currentValue: 0
            }
        


        const n_33_10_STATE = {
            isClosed: true
        }
    

            const n_33_13_STATE = {
                currentValue: 0
            }
        

        const n_33_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_33_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_33_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_33_14_STATE, 1200)
        })
    

        const n_33_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_33_6_STATE.outTemplates[0] = []
            
                n_33_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_33_6_STATE.outMessages[0] = msg_create(n_33_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_33_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_33_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_33_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_33_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_33_4_STATE.outTemplates[0] = []
            
                n_33_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_33_4_STATE.outMessages[0] = msg_create(n_33_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_33_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_33_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_33_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_34_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_34_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_34_2_STATE, 1000)
        })
    

        const n_34_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_34_5_STATE.outTemplates[0] = []
            
                n_34_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_34_5_STATE.outMessages[0] = msg_create(n_34_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_34_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_34_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_34_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_34_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_34_1_STATE, 0)
        

        const n_34_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_34_6_STATE.outTemplates[0] = []
            
                n_34_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_34_6_STATE.outMessages[0] = msg_create(n_34_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_34_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_34_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_34_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_33_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_33_6_RCVS_0(msg_bang()))

            const n_35_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_35_7_STATE, 0)
        

        const n_35_2_STATE = {
            isClosed: true
        }
    


        const n_35_1_STATE = {
            currentValue: 0
        }
    

            const n_35_8_STATE = {
                currentValue: 0
            }
        


        const n_35_10_STATE = {
            isClosed: true
        }
    

            const n_35_13_STATE = {
                currentValue: 0
            }
        

        const n_35_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_35_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_35_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_35_14_STATE, 1200)
        })
    

        const n_35_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_35_6_STATE.outTemplates[0] = []
            
                n_35_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_35_6_STATE.outMessages[0] = msg_create(n_35_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_35_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_35_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_35_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_35_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_35_4_STATE.outTemplates[0] = []
            
                n_35_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_35_4_STATE.outMessages[0] = msg_create(n_35_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_35_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_35_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_35_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_36_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_36_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_36_2_STATE, 1000)
        })
    

        const n_36_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_36_5_STATE.outTemplates[0] = []
            
                n_36_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_36_5_STATE.outMessages[0] = msg_create(n_36_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_36_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_36_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_36_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_36_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_36_1_STATE, 0)
        

        const n_36_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_36_6_STATE.outTemplates[0] = []
            
                n_36_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_36_6_STATE.outMessages[0] = msg_create(n_36_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_36_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_36_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_36_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_35_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_35_6_RCVS_0(msg_bang()))

            const n_37_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_37_7_STATE, 0)
        

        const n_37_2_STATE = {
            isClosed: true
        }
    


        const n_37_1_STATE = {
            currentValue: 0
        }
    

            const n_37_8_STATE = {
                currentValue: 0
            }
        


        const n_37_10_STATE = {
            isClosed: true
        }
    

            const n_37_13_STATE = {
                currentValue: 0
            }
        

        const n_37_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_37_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_37_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_37_14_STATE, 1200)
        })
    

        const n_37_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_37_6_STATE.outTemplates[0] = []
            
                n_37_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_37_6_STATE.outMessages[0] = msg_create(n_37_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_37_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_37_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_37_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_37_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_37_4_STATE.outTemplates[0] = []
            
                n_37_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_37_4_STATE.outMessages[0] = msg_create(n_37_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_37_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_37_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_37_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_38_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_38_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_38_2_STATE, 1000)
        })
    

        const n_38_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_38_5_STATE.outTemplates[0] = []
            
                n_38_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_38_5_STATE.outMessages[0] = msg_create(n_38_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_38_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_38_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_38_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_38_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_38_1_STATE, 0)
        

        const n_38_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_38_6_STATE.outTemplates[0] = []
            
                n_38_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_38_6_STATE.outMessages[0] = msg_create(n_38_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_38_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_38_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_38_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_37_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_37_6_RCVS_0(msg_bang()))

        const n_39_0_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_0_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_0_STATE, m)
            }
            n_39_0_STATE.messageSender = n_39_34_RCVS_0
            n_control_setReceiveBusName(n_39_0_STATE, "empty")
        })

        
    

        const n_39_34_STATE = {
            maxValue: 8
        }
    

        const n_39_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_39_2_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_2_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_2_STATE, m)
            }
            n_39_2_STATE.messageSender = n_11_12_RCVS_0
            n_control_setReceiveBusName(n_39_2_STATE, "empty")
        })

        
    

            const n_11_12_STATE = {
                busName: "grainSizeSeq_3",
            }
        

        const n_39_4_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_4_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_4_STATE, m)
            }
            n_39_4_STATE.messageSender = n_39_35_RCVS_0
            n_control_setReceiveBusName(n_39_4_STATE, "empty")
        })

        
    

        const n_39_35_STATE = {
            maxValue: 6
        }
    

        const n_39_5_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_39_6_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_6_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_6_STATE, m)
            }
            n_39_6_STATE.messageSender = n_11_11_RCVS_0
            n_control_setReceiveBusName(n_39_6_STATE, "empty")
        })

        
    

            const n_11_11_STATE = {
                busName: "pitchSeq_3",
            }
        

        const n_39_7_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_7_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_7_STATE, m)
            }
            n_39_7_STATE.messageSender = n_39_36_RCVS_0
            n_control_setReceiveBusName(n_39_7_STATE, "empty")
        })

        
    

        const n_39_36_STATE = {
            maxValue: 6
        }
    

        const n_39_8_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_39_9_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_9_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_9_STATE, m)
            }
            n_39_9_STATE.messageSender = n_11_10_RCVS_0
            n_control_setReceiveBusName(n_39_9_STATE, "empty")
        })

        
    

            const n_11_10_STATE = {
                busName: "modPosSeq_3",
            }
        

            const n_39_10_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_39_10_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_39_10_STATE, m)
                }
                n_39_10_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_39_10_STATE, "empty")
            })
        

        const n_39_11_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_11_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_11_STATE, m)
            }
            n_39_11_STATE.messageSender = n_39_37_RCVS_0
            n_control_setReceiveBusName(n_39_11_STATE, "empty")
        })

        
    

        const n_39_37_STATE = {
            maxValue: 2
        }
    

        const n_39_12_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_39_13_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_13_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_13_STATE, m)
            }
            n_39_13_STATE.messageSender = n_11_9_RCVS_0
            n_control_setReceiveBusName(n_39_13_STATE, "empty")
        })

        
    

            const n_11_9_STATE = {
                busName: "fwdAmtSeq_3",
            }
        

        const n_39_16_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_16_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_16_STATE, m)
            }
            n_39_16_STATE.messageSender = n_39_33_RCVS_0
            n_control_setReceiveBusName(n_39_16_STATE, "empty")
        })

        
    

        const n_39_33_STATE = {
            maxValue: 8
        }
    

        const n_39_17_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_39_18_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_18_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_18_STATE, m)
            }
            n_39_18_STATE.messageSender = n_11_13_RCVS_0
            n_control_setReceiveBusName(n_39_18_STATE, "empty")
        })

        
    

            const n_11_13_STATE = {
                busName: "randDel3",
            }
        

        const n_39_19_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_39_19_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_39_19_STATE, m)
            }
            n_39_19_STATE.messageSender = n_39_38_RCVS_0
            n_control_setReceiveBusName(n_39_19_STATE, "empty")
        })

        
    

        const n_39_38_STATE = {
            maxValue: 12
        }
    

        const n_39_20_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_39_21_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_21_STATE.outTemplates[0] = []
            
                n_39_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_21_STATE.outMessages[0] = msg_create(n_39_21_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_21_STATE.outMessages[0], 0, 0)
            
        
        
        n_39_21_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_21_STATE.outMessages[0]
                }
,
        ]
    

            const n_11_8_STATE = {
                busName: "positionOffset_3",
            }
        

        const n_39_22_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_22_STATE.outTemplates[0] = []
            
                n_39_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_22_STATE.outMessages[0] = msg_create(n_39_22_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_22_STATE.outMessages[0], 0, 0.25)
            
        
        
        n_39_22_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_22_STATE.outMessages[0]
                }
,
        ]
    

        const n_39_23_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_23_STATE.outTemplates[0] = []
            
                n_39_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_23_STATE.outMessages[0] = msg_create(n_39_23_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_23_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_39_23_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_23_STATE.outMessages[0]
                }
,
        ]
    

        const n_39_24_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_24_STATE.outTemplates[0] = []
            
                n_39_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_24_STATE.outMessages[0] = msg_create(n_39_24_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_24_STATE.outMessages[0], 0, 0.75)
            
        
        
        n_39_24_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_24_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("startBang", n_39_21_RCVS_0)
            })
        
commons_waitFrame(0, () => n_39_26_SNDS_0(msg_bang()))

        const n_39_27_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_27_STATE.outTemplates[0] = []
            
                n_39_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_27_STATE.outMessages[0] = msg_create(n_39_27_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_27_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_39_27_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_27_STATE.outMessages[0]
                }
,
        ]
    

        const n_40_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_40_17_STATE.floatInputs.set(1, 0)
        
    

        const n_39_28_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_28_STATE.outTemplates[0] = []
            
                n_39_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_28_STATE.outMessages[0] = msg_create(n_39_28_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_28_STATE.outMessages[0], 0, 0.9)
            
        
        
        n_39_28_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_28_STATE.outMessages[0]
                }
,
        ]
    

        const n_42_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_42_17_STATE.floatInputs.set(1, 0)
        
    

        const n_39_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_29_STATE.outTemplates[0] = []
            
                n_39_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_29_STATE.outMessages[0] = msg_create(n_39_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_29_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_39_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_29_STATE.outMessages[0]
                }
,
        ]
    

        const n_44_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_44_17_STATE.floatInputs.set(1, 0)
        
    

        const n_39_30_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_30_STATE.outTemplates[0] = []
            
                n_39_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_30_STATE.outMessages[0] = msg_create(n_39_30_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_30_STATE.outMessages[0], 0, 0.2)
            
        
        
        n_39_30_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_30_STATE.outMessages[0]
                }
,
        ]
    

        const n_46_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_46_17_STATE.floatInputs.set(1, 0)
        
    

        const n_39_31_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_31_STATE.outTemplates[0] = []
            
                n_39_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_31_STATE.outMessages[0] = msg_create(n_39_31_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_31_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_39_31_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_31_STATE.outMessages[0]
                }
,
        ]
    

        const n_48_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_48_17_STATE.floatInputs.set(1, 0)
        
    

        const n_39_32_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_39_32_STATE.outTemplates[0] = []
            
                n_39_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_39_32_STATE.outMessages[0] = msg_create(n_39_32_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_39_32_STATE.outMessages[0], 0, 0.4)
            
        
        
        n_39_32_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_39_32_STATE.outMessages[0]
                }
,
        ]
    

        const n_50_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_50_17_STATE.floatInputs.set(1, 0)
        
    

            const n_40_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_40_7_STATE, 0)
        

        const n_40_2_STATE = {
            isClosed: true
        }
    


        const n_40_1_STATE = {
            currentValue: 0
        }
    

            const n_40_8_STATE = {
                currentValue: 0
            }
        


        const n_40_10_STATE = {
            isClosed: true
        }
    

            const n_40_13_STATE = {
                currentValue: 0
            }
        

        const n_40_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_40_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_40_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_40_14_STATE, 1200)
        })
    

        const n_40_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_40_6_STATE.outTemplates[0] = []
            
                n_40_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_40_6_STATE.outMessages[0] = msg_create(n_40_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_40_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_40_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_40_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_40_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_40_4_STATE.outTemplates[0] = []
            
                n_40_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_40_4_STATE.outMessages[0] = msg_create(n_40_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_40_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_40_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_40_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_41_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_41_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_41_2_STATE, 1000)
        })
    

        const n_41_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_41_5_STATE.outTemplates[0] = []
            
                n_41_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_41_5_STATE.outMessages[0] = msg_create(n_41_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_41_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_41_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_41_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_41_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_41_1_STATE, 0)
        

        const n_41_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_41_6_STATE.outTemplates[0] = []
            
                n_41_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_41_6_STATE.outMessages[0] = msg_create(n_41_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_41_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_41_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_41_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_40_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_40_6_RCVS_0(msg_bang()))

            const n_42_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_42_7_STATE, 0)
        

        const n_42_2_STATE = {
            isClosed: true
        }
    


        const n_42_1_STATE = {
            currentValue: 0
        }
    

            const n_42_8_STATE = {
                currentValue: 0
            }
        


        const n_42_10_STATE = {
            isClosed: true
        }
    

            const n_42_13_STATE = {
                currentValue: 0
            }
        

        const n_42_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_42_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_42_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_42_14_STATE, 1200)
        })
    

        const n_42_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_42_6_STATE.outTemplates[0] = []
            
                n_42_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_42_6_STATE.outMessages[0] = msg_create(n_42_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_42_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_42_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_42_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_42_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_42_4_STATE.outTemplates[0] = []
            
                n_42_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_42_4_STATE.outMessages[0] = msg_create(n_42_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_42_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_42_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_42_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_43_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_43_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_43_2_STATE, 1000)
        })
    

        const n_43_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_43_5_STATE.outTemplates[0] = []
            
                n_43_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_43_5_STATE.outMessages[0] = msg_create(n_43_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_43_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_43_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_43_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_43_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_43_1_STATE, 0)
        

        const n_43_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_43_6_STATE.outTemplates[0] = []
            
                n_43_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_43_6_STATE.outMessages[0] = msg_create(n_43_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_43_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_43_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_43_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_42_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_42_6_RCVS_0(msg_bang()))

            const n_44_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_44_7_STATE, 0)
        

        const n_44_2_STATE = {
            isClosed: true
        }
    


        const n_44_1_STATE = {
            currentValue: 0
        }
    

            const n_44_8_STATE = {
                currentValue: 0
            }
        


        const n_44_10_STATE = {
            isClosed: true
        }
    

            const n_44_13_STATE = {
                currentValue: 0
            }
        

        const n_44_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_44_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_44_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_44_14_STATE, 1200)
        })
    

        const n_44_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_44_6_STATE.outTemplates[0] = []
            
                n_44_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_44_6_STATE.outMessages[0] = msg_create(n_44_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_44_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_44_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_44_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_44_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_44_4_STATE.outTemplates[0] = []
            
                n_44_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_44_4_STATE.outMessages[0] = msg_create(n_44_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_44_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_44_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_44_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_45_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_45_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_45_2_STATE, 1000)
        })
    

        const n_45_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_45_5_STATE.outTemplates[0] = []
            
                n_45_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_45_5_STATE.outMessages[0] = msg_create(n_45_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_45_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_45_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_45_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_45_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_45_1_STATE, 0)
        

        const n_45_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_45_6_STATE.outTemplates[0] = []
            
                n_45_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_45_6_STATE.outMessages[0] = msg_create(n_45_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_45_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_45_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_45_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_44_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_44_6_RCVS_0(msg_bang()))

            const n_46_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_46_7_STATE, 0)
        

        const n_46_2_STATE = {
            isClosed: true
        }
    


        const n_46_1_STATE = {
            currentValue: 0
        }
    

            const n_46_8_STATE = {
                currentValue: 0
            }
        


        const n_46_10_STATE = {
            isClosed: true
        }
    

            const n_46_13_STATE = {
                currentValue: 0
            }
        

        const n_46_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_46_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_46_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_46_14_STATE, 1200)
        })
    

        const n_46_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_46_6_STATE.outTemplates[0] = []
            
                n_46_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_46_6_STATE.outMessages[0] = msg_create(n_46_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_46_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_46_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_46_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_46_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_46_4_STATE.outTemplates[0] = []
            
                n_46_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_46_4_STATE.outMessages[0] = msg_create(n_46_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_46_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_46_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_46_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_47_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_47_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_47_2_STATE, 1000)
        })
    

        const n_47_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_47_5_STATE.outTemplates[0] = []
            
                n_47_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_47_5_STATE.outMessages[0] = msg_create(n_47_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_47_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_47_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_47_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_47_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_47_1_STATE, 0)
        

        const n_47_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_47_6_STATE.outTemplates[0] = []
            
                n_47_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_47_6_STATE.outMessages[0] = msg_create(n_47_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_47_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_47_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_47_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_46_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_46_6_RCVS_0(msg_bang()))

            const n_48_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_48_7_STATE, 0)
        

        const n_48_2_STATE = {
            isClosed: true
        }
    


        const n_48_1_STATE = {
            currentValue: 0
        }
    

            const n_48_8_STATE = {
                currentValue: 0
            }
        


        const n_48_10_STATE = {
            isClosed: true
        }
    

            const n_48_13_STATE = {
                currentValue: 0
            }
        

        const n_48_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_48_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_48_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_48_14_STATE, 1200)
        })
    

        const n_48_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_48_6_STATE.outTemplates[0] = []
            
                n_48_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_48_6_STATE.outMessages[0] = msg_create(n_48_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_48_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_48_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_48_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_48_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_48_4_STATE.outTemplates[0] = []
            
                n_48_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_48_4_STATE.outMessages[0] = msg_create(n_48_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_48_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_48_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_48_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_49_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_49_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_49_2_STATE, 1000)
        })
    

        const n_49_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_49_5_STATE.outTemplates[0] = []
            
                n_49_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_49_5_STATE.outMessages[0] = msg_create(n_49_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_49_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_49_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_49_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_49_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_49_1_STATE, 0)
        

        const n_49_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_49_6_STATE.outTemplates[0] = []
            
                n_49_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_49_6_STATE.outMessages[0] = msg_create(n_49_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_49_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_49_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_49_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_48_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_48_6_RCVS_0(msg_bang()))

            const n_50_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_50_7_STATE, 0)
        

        const n_50_2_STATE = {
            isClosed: true
        }
    


        const n_50_1_STATE = {
            currentValue: 0
        }
    

            const n_50_8_STATE = {
                currentValue: 0
            }
        


        const n_50_10_STATE = {
            isClosed: true
        }
    

            const n_50_13_STATE = {
                currentValue: 0
            }
        

        const n_50_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_50_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_50_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_50_14_STATE, 1200)
        })
    

        const n_50_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_50_6_STATE.outTemplates[0] = []
            
                n_50_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_50_6_STATE.outMessages[0] = msg_create(n_50_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_50_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_50_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_50_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_50_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_50_4_STATE.outTemplates[0] = []
            
                n_50_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_50_4_STATE.outMessages[0] = msg_create(n_50_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_50_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_50_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_50_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_51_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_51_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_51_2_STATE, 1000)
        })
    

        const n_51_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_51_5_STATE.outTemplates[0] = []
            
                n_51_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_51_5_STATE.outMessages[0] = msg_create(n_51_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_51_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_51_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_51_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_51_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_51_1_STATE, 0)
        

        const n_51_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_51_6_STATE.outTemplates[0] = []
            
                n_51_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_51_6_STATE.outMessages[0] = msg_create(n_51_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_51_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_51_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_51_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_50_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_50_6_RCVS_0(msg_bang()))

        const n_52_0_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_0_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_0_STATE, m)
            }
            n_52_0_STATE.messageSender = n_52_34_RCVS_0
            n_control_setReceiveBusName(n_52_0_STATE, "empty")
        })

        
    

        const n_52_34_STATE = {
            maxValue: 8
        }
    

        const n_52_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_52_2_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_2_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_2_STATE, m)
            }
            n_52_2_STATE.messageSender = n_10_8_RCVS_0
            n_control_setReceiveBusName(n_52_2_STATE, "empty")
        })

        
    

            const n_10_8_STATE = {
                busName: "grainSizeSeq_4",
            }
        

        const n_52_4_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_4_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_4_STATE, m)
            }
            n_52_4_STATE.messageSender = n_52_35_RCVS_0
            n_control_setReceiveBusName(n_52_4_STATE, "empty")
        })

        
    

        const n_52_35_STATE = {
            maxValue: 6
        }
    

        const n_52_5_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_52_6_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_6_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_6_STATE, m)
            }
            n_52_6_STATE.messageSender = n_10_9_RCVS_0
            n_control_setReceiveBusName(n_52_6_STATE, "empty")
        })

        
    

            const n_10_9_STATE = {
                busName: "pitchSeq_4",
            }
        

        const n_52_7_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_7_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_7_STATE, m)
            }
            n_52_7_STATE.messageSender = n_52_36_RCVS_0
            n_control_setReceiveBusName(n_52_7_STATE, "empty")
        })

        
    

        const n_52_36_STATE = {
            maxValue: 6
        }
    

        const n_52_8_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_52_9_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_9_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_9_STATE, m)
            }
            n_52_9_STATE.messageSender = n_10_10_RCVS_0
            n_control_setReceiveBusName(n_52_9_STATE, "empty")
        })

        
    

            const n_10_10_STATE = {
                busName: "modPosSeq_4",
            }
        

            const n_52_10_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_52_10_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_52_10_STATE, m)
                }
                n_52_10_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_52_10_STATE, "empty")
            })
        

        const n_52_11_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_11_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_11_STATE, m)
            }
            n_52_11_STATE.messageSender = n_52_37_RCVS_0
            n_control_setReceiveBusName(n_52_11_STATE, "empty")
        })

        
    

        const n_52_37_STATE = {
            maxValue: 2
        }
    

        const n_52_12_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_52_13_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_13_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_13_STATE, m)
            }
            n_52_13_STATE.messageSender = n_10_11_RCVS_0
            n_control_setReceiveBusName(n_52_13_STATE, "empty")
        })

        
    

            const n_10_11_STATE = {
                busName: "fwdAmtSeq_4",
            }
        

        const n_52_16_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_16_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_16_STATE, m)
            }
            n_52_16_STATE.messageSender = n_52_33_RCVS_0
            n_control_setReceiveBusName(n_52_16_STATE, "empty")
        })

        
    

        const n_52_33_STATE = {
            maxValue: 8
        }
    

        const n_52_17_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_52_18_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_18_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_18_STATE, m)
            }
            n_52_18_STATE.messageSender = n_10_7_RCVS_0
            n_control_setReceiveBusName(n_52_18_STATE, "empty")
        })

        
    

            const n_10_7_STATE = {
                busName: "randDel4",
            }
        

        const n_52_19_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_52_19_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_52_19_STATE, m)
            }
            n_52_19_STATE.messageSender = n_52_38_RCVS_0
            n_control_setReceiveBusName(n_52_19_STATE, "empty")
        })

        
    

        const n_52_38_STATE = {
            maxValue: 12
        }
    

        const n_52_20_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_52_21_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_21_STATE.outTemplates[0] = []
            
                n_52_21_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_21_STATE.outMessages[0] = msg_create(n_52_21_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_21_STATE.outMessages[0], 0, 0)
            
        
        
        n_52_21_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_21_STATE.outMessages[0]
                }
,
        ]
    

            const n_10_12_STATE = {
                busName: "positionOffset_4",
            }
        

        const n_52_22_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_22_STATE.outTemplates[0] = []
            
                n_52_22_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_22_STATE.outMessages[0] = msg_create(n_52_22_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_22_STATE.outMessages[0], 0, 0.25)
            
        
        
        n_52_22_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_22_STATE.outMessages[0]
                }
,
        ]
    

        const n_52_23_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_23_STATE.outTemplates[0] = []
            
                n_52_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_23_STATE.outMessages[0] = msg_create(n_52_23_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_23_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_52_23_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_23_STATE.outMessages[0]
                }
,
        ]
    

        const n_52_24_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_24_STATE.outTemplates[0] = []
            
                n_52_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_24_STATE.outMessages[0] = msg_create(n_52_24_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_24_STATE.outMessages[0], 0, 0.75)
            
        
        
        n_52_24_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_24_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("startBang", n_52_21_RCVS_0)
            })
        
commons_waitFrame(0, () => n_52_26_SNDS_0(msg_bang()))

        const n_52_27_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_27_STATE.outTemplates[0] = []
            
                n_52_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_27_STATE.outMessages[0] = msg_create(n_52_27_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_27_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_52_27_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_27_STATE.outMessages[0]
                }
,
        ]
    

        const n_53_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_53_17_STATE.floatInputs.set(1, 0)
        
    

        const n_52_28_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_28_STATE.outTemplates[0] = []
            
                n_52_28_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_28_STATE.outMessages[0] = msg_create(n_52_28_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_28_STATE.outMessages[0], 0, 0.9)
            
        
        
        n_52_28_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_28_STATE.outMessages[0]
                }
,
        ]
    

        const n_55_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_55_17_STATE.floatInputs.set(1, 0)
        
    

        const n_52_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_29_STATE.outTemplates[0] = []
            
                n_52_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_29_STATE.outMessages[0] = msg_create(n_52_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_29_STATE.outMessages[0], 0, 0.5)
            
        
        
        n_52_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_29_STATE.outMessages[0]
                }
,
        ]
    

        const n_57_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_57_17_STATE.floatInputs.set(1, 0)
        
    

        const n_52_30_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_30_STATE.outTemplates[0] = []
            
                n_52_30_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_30_STATE.outMessages[0] = msg_create(n_52_30_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_30_STATE.outMessages[0], 0, 0.2)
            
        
        
        n_52_30_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_30_STATE.outMessages[0]
                }
,
        ]
    

        const n_59_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_59_17_STATE.floatInputs.set(1, 0)
        
    

        const n_52_31_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_31_STATE.outTemplates[0] = []
            
                n_52_31_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_31_STATE.outMessages[0] = msg_create(n_52_31_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_31_STATE.outMessages[0], 0, 0.1)
            
        
        
        n_52_31_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_31_STATE.outMessages[0]
                }
,
        ]
    

        const n_61_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_61_17_STATE.floatInputs.set(1, 0)
        
    

        const n_52_32_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_52_32_STATE.outTemplates[0] = []
            
                n_52_32_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_52_32_STATE.outMessages[0] = msg_create(n_52_32_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_52_32_STATE.outMessages[0], 0, 0.4)
            
        
        
        n_52_32_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_52_32_STATE.outMessages[0]
                }
,
        ]
    

        const n_63_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_63_17_STATE.floatInputs.set(1, 0)
        
    

            const n_53_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_53_7_STATE, 0)
        

        const n_53_2_STATE = {
            isClosed: true
        }
    


        const n_53_1_STATE = {
            currentValue: 0
        }
    

            const n_53_8_STATE = {
                currentValue: 0
            }
        


        const n_53_10_STATE = {
            isClosed: true
        }
    

            const n_53_13_STATE = {
                currentValue: 0
            }
        

        const n_53_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_53_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_53_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_53_14_STATE, 1200)
        })
    

        const n_53_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_53_6_STATE.outTemplates[0] = []
            
                n_53_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_53_6_STATE.outMessages[0] = msg_create(n_53_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_53_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_53_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_53_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_53_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_53_4_STATE.outTemplates[0] = []
            
                n_53_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_53_4_STATE.outMessages[0] = msg_create(n_53_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_53_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_53_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_53_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_54_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_54_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_54_2_STATE, 1000)
        })
    

        const n_54_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_54_5_STATE.outTemplates[0] = []
            
                n_54_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_54_5_STATE.outMessages[0] = msg_create(n_54_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_54_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_54_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_54_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_54_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_54_1_STATE, 0)
        

        const n_54_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_54_6_STATE.outTemplates[0] = []
            
                n_54_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_54_6_STATE.outMessages[0] = msg_create(n_54_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_54_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_54_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_54_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_53_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_53_6_RCVS_0(msg_bang()))

            const n_55_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_55_7_STATE, 0)
        

        const n_55_2_STATE = {
            isClosed: true
        }
    


        const n_55_1_STATE = {
            currentValue: 0
        }
    

            const n_55_8_STATE = {
                currentValue: 0
            }
        


        const n_55_10_STATE = {
            isClosed: true
        }
    

            const n_55_13_STATE = {
                currentValue: 0
            }
        

        const n_55_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_55_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_55_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_55_14_STATE, 1200)
        })
    

        const n_55_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_55_6_STATE.outTemplates[0] = []
            
                n_55_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_55_6_STATE.outMessages[0] = msg_create(n_55_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_55_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_55_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_55_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_55_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_55_4_STATE.outTemplates[0] = []
            
                n_55_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_55_4_STATE.outMessages[0] = msg_create(n_55_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_55_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_55_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_55_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_56_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_56_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_56_2_STATE, 1000)
        })
    

        const n_56_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_56_5_STATE.outTemplates[0] = []
            
                n_56_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_56_5_STATE.outMessages[0] = msg_create(n_56_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_56_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_56_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_56_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_56_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_56_1_STATE, 0)
        

        const n_56_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_56_6_STATE.outTemplates[0] = []
            
                n_56_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_56_6_STATE.outMessages[0] = msg_create(n_56_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_56_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_56_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_56_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_55_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_55_6_RCVS_0(msg_bang()))

            const n_57_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_57_7_STATE, 0)
        

        const n_57_2_STATE = {
            isClosed: true
        }
    


        const n_57_1_STATE = {
            currentValue: 0
        }
    

            const n_57_8_STATE = {
                currentValue: 0
            }
        


        const n_57_10_STATE = {
            isClosed: true
        }
    

            const n_57_13_STATE = {
                currentValue: 0
            }
        

        const n_57_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_57_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_57_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_57_14_STATE, 1200)
        })
    

        const n_57_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_57_6_STATE.outTemplates[0] = []
            
                n_57_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_57_6_STATE.outMessages[0] = msg_create(n_57_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_57_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_57_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_57_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_57_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_57_4_STATE.outTemplates[0] = []
            
                n_57_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_57_4_STATE.outMessages[0] = msg_create(n_57_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_57_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_57_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_57_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_58_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_58_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_58_2_STATE, 1000)
        })
    

        const n_58_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_58_5_STATE.outTemplates[0] = []
            
                n_58_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_58_5_STATE.outMessages[0] = msg_create(n_58_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_58_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_58_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_58_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_58_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_58_1_STATE, 0)
        

        const n_58_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_58_6_STATE.outTemplates[0] = []
            
                n_58_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_58_6_STATE.outMessages[0] = msg_create(n_58_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_58_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_58_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_58_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_57_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_57_6_RCVS_0(msg_bang()))

            const n_59_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_59_7_STATE, 0)
        

        const n_59_2_STATE = {
            isClosed: true
        }
    


        const n_59_1_STATE = {
            currentValue: 0
        }
    

            const n_59_8_STATE = {
                currentValue: 0
            }
        


        const n_59_10_STATE = {
            isClosed: true
        }
    

            const n_59_13_STATE = {
                currentValue: 0
            }
        

        const n_59_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_59_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_59_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_59_14_STATE, 1200)
        })
    

        const n_59_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_59_6_STATE.outTemplates[0] = []
            
                n_59_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_59_6_STATE.outMessages[0] = msg_create(n_59_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_59_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_59_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_59_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_59_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_59_4_STATE.outTemplates[0] = []
            
                n_59_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_59_4_STATE.outMessages[0] = msg_create(n_59_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_59_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_59_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_59_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_60_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_60_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_60_2_STATE, 1000)
        })
    

        const n_60_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_60_5_STATE.outTemplates[0] = []
            
                n_60_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_60_5_STATE.outMessages[0] = msg_create(n_60_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_60_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_60_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_60_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_60_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_60_1_STATE, 0)
        

        const n_60_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_60_6_STATE.outTemplates[0] = []
            
                n_60_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_60_6_STATE.outMessages[0] = msg_create(n_60_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_60_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_60_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_60_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_59_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_59_6_RCVS_0(msg_bang()))

            const n_61_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_61_7_STATE, 0)
        

        const n_61_2_STATE = {
            isClosed: true
        }
    


        const n_61_1_STATE = {
            currentValue: 0
        }
    

            const n_61_8_STATE = {
                currentValue: 0
            }
        


        const n_61_10_STATE = {
            isClosed: true
        }
    

            const n_61_13_STATE = {
                currentValue: 0
            }
        

        const n_61_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_61_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_61_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_61_14_STATE, 1200)
        })
    

        const n_61_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_61_6_STATE.outTemplates[0] = []
            
                n_61_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_61_6_STATE.outMessages[0] = msg_create(n_61_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_61_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_61_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_61_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_61_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_61_4_STATE.outTemplates[0] = []
            
                n_61_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_61_4_STATE.outMessages[0] = msg_create(n_61_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_61_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_61_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_61_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_62_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_62_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_62_2_STATE, 1000)
        })
    

        const n_62_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_62_5_STATE.outTemplates[0] = []
            
                n_62_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_62_5_STATE.outMessages[0] = msg_create(n_62_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_62_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_62_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_62_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_62_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_62_1_STATE, 0)
        

        const n_62_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_62_6_STATE.outTemplates[0] = []
            
                n_62_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_62_6_STATE.outMessages[0] = msg_create(n_62_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_62_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_62_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_62_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_61_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_61_6_RCVS_0(msg_bang()))

            const n_63_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_63_7_STATE, 0)
        

        const n_63_2_STATE = {
            isClosed: true
        }
    


        const n_63_1_STATE = {
            currentValue: 0
        }
    

            const n_63_8_STATE = {
                currentValue: 0
            }
        


        const n_63_10_STATE = {
            isClosed: true
        }
    

            const n_63_13_STATE = {
                currentValue: 0
            }
        

        const n_63_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_63_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_63_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_63_14_STATE, 1200)
        })
    

        const n_63_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_63_6_STATE.outTemplates[0] = []
            
                n_63_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_63_6_STATE.outMessages[0] = msg_create(n_63_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_63_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_63_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_63_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_63_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_63_4_STATE.outTemplates[0] = []
            
                n_63_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_63_4_STATE.outMessages[0] = msg_create(n_63_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_63_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_63_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_63_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_64_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_64_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_64_2_STATE, 1000)
        })
    

        const n_64_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_64_5_STATE.outTemplates[0] = []
            
                n_64_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_64_5_STATE.outMessages[0] = msg_create(n_64_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_64_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_64_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_64_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_64_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_64_1_STATE, 0)
        

        const n_64_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_64_6_STATE.outTemplates[0] = []
            
                n_64_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_64_6_STATE.outMessages[0] = msg_create(n_64_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_64_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_64_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_64_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_63_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_63_6_RCVS_0(msg_bang()))

            const n_65_9_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_65_9_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_65_9_STATE, m)
                }
                n_65_9_STATE.messageSender = n_65_9_SNDS_0
                n_control_setReceiveBusName(n_65_9_STATE, "empty")
            })
        


        const n_65_13_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_div_setLeft(n_65_13_STATE, 0)
            n_div_setRight(n_65_13_STATE, 1)
        

        const n_65_18_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_65_18_STATE, 0)
            n_mul_setRight(n_65_18_STATE, 0.1)
        

        const n_65_19_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_65_19_STATE, 0)
            n_add_setRight(n_65_19_STATE, 0.005)
        


            const m_n_65_10_0_sig_STATE = {
                currentValue: 0.09
            }
        

        const n_65_11_STATE = {
            maxValue: 9
        }
    

        const n_65_12_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_65_12_STATE, 0)
            n_add_setRight(n_65_12_STATE, 1)
        

            const n_65_14_STATE = {
                value: msg_floats([0]),
                receiveBusName: "empty",
                sendBusName: "empty",
                messageReceiver: n_control_defaultMessageHandler,
                messageSender: n_control_defaultMessageHandler,
            }
        
            commons_waitEngineConfigure(() => {
                n_65_14_STATE.messageReceiver = function (m) {
                    n_floatatom_receiveMessage(n_65_14_STATE, m)
                }
                n_65_14_STATE.messageSender = SND_TO_NULL
                n_control_setReceiveBusName(n_65_14_STATE, "empty")
            })
        

            const n_65_21_STATE = {
                busName: "bassTrig",
            }
        

            const n_65_17_STATE = {
                busName: "songSelectaBang",
            }
        

        const n_65_20_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_mul_setLeft(n_65_20_STATE, 0)
            n_mul_setRight(n_65_20_STATE, 0.3)
        

        const n_65_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_65_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_65_5_STATE.outTemplates[0] = []
            
                n_65_5_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_65_5_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_65_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_65_5_STATE.outMessages[0] = msg_create(n_65_5_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_65_5_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_65_5_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_65_5_STATE.outMessages[0], 1, 50)
            
        
                    return n_65_5_STATE.outMessages[0]
                }
,
        ]
    

        const n_65_4_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    
commons_waitFrame(0, () => n_65_24_RCVS_0(msg_bang()))

        const n_65_24_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_65_24_STATE.outTemplates[0] = []
            
                n_65_24_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_65_24_STATE.outMessages[0] = msg_create(n_65_24_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_65_24_STATE.outMessages[0], 0, 0.01)
            
        
        
        n_65_24_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_65_24_STATE.outMessages[0]
                }
,
        ]
    

        const n_66_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_66_17_STATE.floatInputs.set(1, 0)
        
    

            const n_66_7_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_66_7_STATE, 0)
        

        const n_66_2_STATE = {
            isClosed: true
        }
    


        const n_66_1_STATE = {
            currentValue: 0
        }
    

            const n_66_8_STATE = {
                currentValue: 0
            }
        


        const n_66_10_STATE = {
            isClosed: true
        }
    

            const n_66_13_STATE = {
                currentValue: 0
            }
        

        const n_66_9_STATE = {
            floatFilter: 1,
            stringFilter: "1",
            filterType: MSG_FLOAT_TOKEN,
        }
    



        const n_65_8_STATE = {
            currentValue: 0
        }
    


        const n_66_14_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_66_14_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_66_14_STATE, 1200)
        })
    

        const n_66_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_66_6_STATE.outTemplates[0] = []
            
                n_66_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_66_6_STATE.outMessages[0] = msg_create(n_66_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_66_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_66_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_66_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_66_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_66_4_STATE.outTemplates[0] = []
            
                n_66_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_66_4_STATE.outMessages[0] = msg_create(n_66_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_66_4_STATE.outMessages[0], 0, 0)
            
        
        
        n_66_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_66_4_STATE.outMessages[0]
                }
,
        ]
    


        const n_67_2_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_67_2_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_67_2_STATE, 1000)
        })
    

        const n_67_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_67_5_STATE.outTemplates[0] = []
            
                n_67_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_67_5_STATE.outMessages[0] = msg_create(n_67_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_67_5_STATE.outMessages[0], 0, 0)
            
        
        
        n_67_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_67_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_67_1_STATE = {
                value: 0,
            }
            n_float_int_setValueInt(n_67_1_STATE, 0)
        

        const n_67_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_67_6_STATE.outTemplates[0] = []
            
                n_67_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_67_6_STATE.outMessages[0] = msg_create(n_67_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_67_6_STATE.outMessages[0], 0, 1)
            
        
        
        n_67_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_67_6_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("genMetro", n_66_2_RCVS_0)
            })
        
commons_waitFrame(0, () => n_66_6_RCVS_0(msg_bang()))

            const m_n_0_6_0_sig_STATE = {
                currentValue: 0.0218
            }
        

            const n_0_6_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_6_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

        const n_0_37_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_37_STATE, "masterOsc")
    

        const n_0_38_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_38_STATE, "osc2SeqFb")
    



            const m_n_0_7_0_sig_STATE = {
                currentValue: 0.033
            }
        

            const n_0_7_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_7_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        


        const n_0_3_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_3_STATE, "osc1SeqFb")
    

        const n_1_0_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_1_0_STATE, "osc3SeqFb")
    

        const n_1_2_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_1_2_STATE, "osc4SeqFb")
    


            const m_n_1_4_1_sig_STATE = {
                currentValue: 0.3
            }
        




            const n_0_1_STATE = {
                minValue: -1,
                maxValue: 1,
            }
        

            const m_n_0_56_1_sig_STATE = {
                currentValue: 1
            }
        


            const m_n_0_57_1_sig_STATE = {
                currentValue: 0.5
            }
        


        const n_0_4_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_4_STATE, "osc1SeqFb")
    

        const n_0_8_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_8_STATE, "bus1_vol")
    

            const m_n_0_21_0_sig_STATE = {
                currentValue: 0.0618
            }
        

            const n_0_21_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_21_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

        const n_0_41_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_41_STATE, "masterOsc")
    

        const n_0_42_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_42_STATE, "osc3SeqFb")
    



            const m_n_0_43_0_sig_STATE = {
                currentValue: 0.013
            }
        

            const n_0_43_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_43_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        


        const n_0_29_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_29_STATE, "osc2SeqFb")
    

        const n_3_6_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_3_6_STATE, "osc1SeqFb")
    

        const n_3_1_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_3_1_STATE, "osc4SeqFb")
    


            const m_n_3_3_1_sig_STATE = {
                currentValue: 0.3
            }
        




            const n_0_10_STATE = {
                minValue: -1,
                maxValue: 1,
            }
        

            const m_n_0_58_1_sig_STATE = {
                currentValue: 1
            }
        


            const m_n_0_59_1_sig_STATE = {
                currentValue: 0.5
            }
        


        const n_0_26_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_26_STATE, "bus2_vol")
    

            const m_n_0_23_0_sig_STATE = {
                currentValue: 0.018
            }
        

            const n_0_23_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_23_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

        const n_0_45_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_45_STATE, "masterOsc")
    

        const n_0_47_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_47_STATE, "osc4SeqFb")
    



            const m_n_0_22_0_sig_STATE = {
                currentValue: 0.093
            }
        

            const n_0_22_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_22_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        


        const n_0_33_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_33_STATE, "osc3SeqFb")
    

        const n_5_5_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_5_5_STATE, "osc1SeqFb")
    

        const n_5_6_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_5_6_STATE, "osc2SeqFb")
    


            const m_n_5_2_1_sig_STATE = {
                currentValue: 0.3
            }
        




            const n_0_14_STATE = {
                minValue: -1,
                maxValue: 1,
            }
        

            const m_n_0_60_1_sig_STATE = {
                currentValue: 1
            }
        


            const m_n_0_61_1_sig_STATE = {
                currentValue: 0.5
            }
        


        const n_0_27_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_27_STATE, "bus3_vol")
    

            const m_n_0_24_0_sig_STATE = {
                currentValue: 0.0188
            }
        

            const n_0_24_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_24_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

        const n_0_49_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_49_STATE, "masterOsc")
    

        const n_0_50_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_50_STATE, "osc1SeqFb")
    



            const m_n_0_25_0_sig_STATE = {
                currentValue: 0.053
            }
        

            const n_0_25_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_25_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        


        const n_0_34_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_34_STATE, "osc4SeqFb")
    

        const n_7_6_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_7_6_STATE, "osc3SeqFb")
    

        const n_7_5_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_7_5_STATE, "osc2SeqFb")
    


            const m_n_7_2_1_sig_STATE = {
                currentValue: 0.3
            }
        




            const n_0_18_STATE = {
                minValue: -1,
                maxValue: 1,
            }
        

            const m_n_0_62_1_sig_STATE = {
                currentValue: 1
            }
        


            const m_n_0_63_1_sig_STATE = {
                currentValue: 0.5
            }
        


        const n_0_28_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_28_STATE, "bus4_vol")
    

        const n_0_30_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_30_STATE, "osc2SeqFb")
    

        const n_0_31_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_31_STATE, "osc3SeqFb")
    

        const n_0_32_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_32_STATE, "osc4SeqFb")
    

            const m_n_13_15_0_sig_STATE = {
                currentValue: 0.25
            }
        

            const n_13_15_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_13_15_STATE.J = 1 / SAMPLE_RATE
            })
        

        const n_13_14_STATE = {
            signalMemory: 0,
            controlMemory: 0,
        }
    

        const n_9_4_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_9_4_STATE, "delSend_1")
    

            const m_n_52_15_0_sig_STATE = {
                currentValue: 0.25
            }
        

            const n_52_15_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_52_15_STATE.J = 1 / SAMPLE_RATE
            })
        

        const n_52_14_STATE = {
            signalMemory: 0,
            controlMemory: 0,
        }
    

        const n_10_13_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_10_13_STATE, "delSend_4")
    

            const m_n_39_15_0_sig_STATE = {
                currentValue: 0.25
            }
        

            const n_39_15_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_39_15_STATE.J = 1 / SAMPLE_RATE
            })
        

        const n_39_14_STATE = {
            signalMemory: 0,
            controlMemory: 0,
        }
    

        const n_11_7_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_11_7_STATE, "delSend_3")
    

            const m_n_26_15_0_sig_STATE = {
                currentValue: 0.25
            }
        

            const n_26_15_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_26_15_STATE.J = 1 / SAMPLE_RATE
            })
        

        const n_26_14_STATE = {
            signalMemory: 0,
            controlMemory: 0,
        }
    

        const n_12_7_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_12_7_STATE, "delSend_2")
    

            const m_n_65_15_0_sig_STATE = {
                currentValue: 0.05
            }
        

            const n_65_15_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_65_15_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_65_6_0_sig_STATE = {
                currentValue: 0.075
            }
        

            const n_65_6_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_65_6_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        




        const n_65_0_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_65_0_STATE, "masterOsc")
    

            const n_65_10_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_65_10_STATE.J = 1 / SAMPLE_RATE
            })
        

        const n_65_7_STATE = {
            signalMemory: 0,
            controlMemory: 0,
        }
    

            const m_n_65_25_1_sig_STATE = {
                currentValue: 1
            }
        


            const m_n_65_26_1_sig_STATE = {
                currentValue: 10
            }
        


        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{},"messageSenders":{}}}}},
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
            
        n_0_6_OUTS_0 = Math.cos(n_0_6_STATE.phase)
        n_0_6_STATE.phase += (n_0_6_STATE.J * m_n_0_6_0_sig_STATE.currentValue)
    

        n_0_7_OUTS_0 = Math.cos(n_0_7_STATE.phase)
        n_0_7_STATE.phase += (n_0_7_STATE.J * m_n_0_7_0_sig_STATE.currentValue)
    
n_1_4_OUTS_0 = (readSignalBus(n_1_0_STATE.busName) * readSignalBus(n_1_2_STATE.busName)) * m_n_1_4_1_sig_STATE.currentValue
n_0_57_OUTS_0 = ((Math.max(Math.min(n_0_1_STATE.maxValue, (((n_0_6_OUTS_0 + (readSignalBus(n_0_37_STATE.busName) * readSignalBus(n_0_38_STATE.busName))) * n_0_7_OUTS_0) + (readSignalBus(n_0_3_STATE.busName) * n_1_4_OUTS_0))), n_0_1_STATE.minValue)) + m_n_0_56_1_sig_STATE.currentValue) * m_n_0_57_1_sig_STATE.currentValue

        setSignalBus(n_0_4_STATE.busName, n_0_57_OUTS_0)
    

        setSignalBus(n_0_8_STATE.busName, n_0_57_OUTS_0)
    

        n_0_21_OUTS_0 = Math.cos(n_0_21_STATE.phase)
        n_0_21_STATE.phase += (n_0_21_STATE.J * m_n_0_21_0_sig_STATE.currentValue)
    

        n_0_43_OUTS_0 = Math.cos(n_0_43_STATE.phase)
        n_0_43_STATE.phase += (n_0_43_STATE.J * m_n_0_43_0_sig_STATE.currentValue)
    
n_3_3_OUTS_0 = (readSignalBus(n_3_6_STATE.busName) * readSignalBus(n_3_1_STATE.busName)) * m_n_3_3_1_sig_STATE.currentValue
n_0_59_OUTS_0 = ((Math.max(Math.min(n_0_10_STATE.maxValue, (((n_0_21_OUTS_0 + (readSignalBus(n_0_41_STATE.busName) * readSignalBus(n_0_42_STATE.busName))) * n_0_43_OUTS_0) + (readSignalBus(n_0_29_STATE.busName) * n_3_3_OUTS_0))), n_0_10_STATE.minValue)) + m_n_0_58_1_sig_STATE.currentValue) * m_n_0_59_1_sig_STATE.currentValue

        setSignalBus(n_0_26_STATE.busName, n_0_59_OUTS_0)
    

        n_0_23_OUTS_0 = Math.cos(n_0_23_STATE.phase)
        n_0_23_STATE.phase += (n_0_23_STATE.J * m_n_0_23_0_sig_STATE.currentValue)
    

        n_0_22_OUTS_0 = Math.cos(n_0_22_STATE.phase)
        n_0_22_STATE.phase += (n_0_22_STATE.J * m_n_0_22_0_sig_STATE.currentValue)
    
n_5_2_OUTS_0 = (readSignalBus(n_5_5_STATE.busName) * readSignalBus(n_5_6_STATE.busName)) * m_n_5_2_1_sig_STATE.currentValue
n_0_61_OUTS_0 = ((Math.max(Math.min(n_0_14_STATE.maxValue, (((n_0_23_OUTS_0 + (readSignalBus(n_0_45_STATE.busName) * readSignalBus(n_0_47_STATE.busName))) * n_0_22_OUTS_0) + (readSignalBus(n_0_33_STATE.busName) * n_5_2_OUTS_0))), n_0_14_STATE.minValue)) + m_n_0_60_1_sig_STATE.currentValue) * m_n_0_61_1_sig_STATE.currentValue

        setSignalBus(n_0_27_STATE.busName, n_0_61_OUTS_0)
    

        n_0_24_OUTS_0 = Math.cos(n_0_24_STATE.phase)
        n_0_24_STATE.phase += (n_0_24_STATE.J * m_n_0_24_0_sig_STATE.currentValue)
    

        n_0_25_OUTS_0 = Math.cos(n_0_25_STATE.phase)
        n_0_25_STATE.phase += (n_0_25_STATE.J * m_n_0_25_0_sig_STATE.currentValue)
    
n_7_2_OUTS_0 = (readSignalBus(n_7_6_STATE.busName) * readSignalBus(n_7_5_STATE.busName)) * m_n_7_2_1_sig_STATE.currentValue
n_0_63_OUTS_0 = ((Math.max(Math.min(n_0_18_STATE.maxValue, (((n_0_24_OUTS_0 + (readSignalBus(n_0_49_STATE.busName) * readSignalBus(n_0_50_STATE.busName))) * n_0_25_OUTS_0) + (readSignalBus(n_0_34_STATE.busName) * n_7_2_OUTS_0))), n_0_18_STATE.minValue)) + m_n_0_62_1_sig_STATE.currentValue) * m_n_0_63_1_sig_STATE.currentValue

        setSignalBus(n_0_28_STATE.busName, n_0_63_OUTS_0)
    

        setSignalBus(n_0_30_STATE.busName, n_0_59_OUTS_0)
    

        setSignalBus(n_0_31_STATE.busName, n_0_61_OUTS_0)
    

        setSignalBus(n_0_32_STATE.busName, n_0_63_OUTS_0)
    

    n_2_3_STATE.currentValue = n_1_4_OUTS_0


    n_4_3_STATE.currentValue = n_3_3_OUTS_0


    n_6_3_STATE.currentValue = n_5_2_OUTS_0


    n_8_3_STATE.currentValue = n_7_2_OUTS_0


        n_13_15_OUTS_0 = n_13_15_STATE.phase % 1
        n_13_15_STATE.phase += (n_13_15_STATE.J * m_n_13_15_0_sig_STATE.currentValue)
    

    n_13_14_STATE.signalMemory = n_13_14_OUTS_0 = n_13_15_OUTS_0 < n_13_14_STATE.controlMemory ? n_0_57_OUTS_0: n_13_14_STATE.signalMemory
    n_13_14_STATE.controlMemory = n_13_15_OUTS_0


        setSignalBus(n_9_4_STATE.busName, n_13_14_OUTS_0)
    
n_14_17_OUTS_0 = +(n_0_57_OUTS_0 >= n_14_17_STATE.floatInputs.get(1))

    n_14_1_STATE.currentValue = n_14_17_OUTS_0

n_16_17_OUTS_0 = +(n_0_57_OUTS_0 >= n_16_17_STATE.floatInputs.get(1))

    n_16_1_STATE.currentValue = n_16_17_OUTS_0

n_18_17_OUTS_0 = +(n_0_57_OUTS_0 >= n_18_17_STATE.floatInputs.get(1))

    n_18_1_STATE.currentValue = n_18_17_OUTS_0

n_20_17_OUTS_0 = +(n_0_57_OUTS_0 >= n_20_17_STATE.floatInputs.get(1))

    n_20_1_STATE.currentValue = n_20_17_OUTS_0

n_22_17_OUTS_0 = +(n_0_57_OUTS_0 >= n_22_17_STATE.floatInputs.get(1))

    n_22_1_STATE.currentValue = n_22_17_OUTS_0

n_24_17_OUTS_0 = +(n_0_57_OUTS_0 >= n_24_17_STATE.floatInputs.get(1))

    n_24_1_STATE.currentValue = n_24_17_OUTS_0

n_27_17_OUTS_0 = +(n_0_59_OUTS_0 >= n_27_17_STATE.floatInputs.get(1))

    n_27_1_STATE.currentValue = n_27_17_OUTS_0

n_29_17_OUTS_0 = +(n_0_59_OUTS_0 >= n_29_17_STATE.floatInputs.get(1))

    n_29_1_STATE.currentValue = n_29_17_OUTS_0

n_31_17_OUTS_0 = +(n_0_59_OUTS_0 >= n_31_17_STATE.floatInputs.get(1))

    n_31_1_STATE.currentValue = n_31_17_OUTS_0

n_33_17_OUTS_0 = +(n_0_59_OUTS_0 >= n_33_17_STATE.floatInputs.get(1))

    n_33_1_STATE.currentValue = n_33_17_OUTS_0

n_35_17_OUTS_0 = +(n_0_59_OUTS_0 >= n_35_17_STATE.floatInputs.get(1))

    n_35_1_STATE.currentValue = n_35_17_OUTS_0

n_37_17_OUTS_0 = +(n_0_59_OUTS_0 >= n_37_17_STATE.floatInputs.get(1))

    n_37_1_STATE.currentValue = n_37_17_OUTS_0

n_40_17_OUTS_0 = +(n_0_61_OUTS_0 >= n_40_17_STATE.floatInputs.get(1))

    n_40_1_STATE.currentValue = n_40_17_OUTS_0

n_42_17_OUTS_0 = +(n_0_61_OUTS_0 >= n_42_17_STATE.floatInputs.get(1))

    n_42_1_STATE.currentValue = n_42_17_OUTS_0

n_44_17_OUTS_0 = +(n_0_61_OUTS_0 >= n_44_17_STATE.floatInputs.get(1))

    n_44_1_STATE.currentValue = n_44_17_OUTS_0

n_46_17_OUTS_0 = +(n_0_61_OUTS_0 >= n_46_17_STATE.floatInputs.get(1))

    n_46_1_STATE.currentValue = n_46_17_OUTS_0

n_48_17_OUTS_0 = +(n_0_61_OUTS_0 >= n_48_17_STATE.floatInputs.get(1))

    n_48_1_STATE.currentValue = n_48_17_OUTS_0

n_50_17_OUTS_0 = +(n_0_61_OUTS_0 >= n_50_17_STATE.floatInputs.get(1))

    n_50_1_STATE.currentValue = n_50_17_OUTS_0

n_53_17_OUTS_0 = +(n_0_63_OUTS_0 >= n_53_17_STATE.floatInputs.get(1))

    n_53_1_STATE.currentValue = n_53_17_OUTS_0

n_55_17_OUTS_0 = +(n_0_63_OUTS_0 >= n_55_17_STATE.floatInputs.get(1))

    n_55_1_STATE.currentValue = n_55_17_OUTS_0

n_57_17_OUTS_0 = +(n_0_63_OUTS_0 >= n_57_17_STATE.floatInputs.get(1))

    n_57_1_STATE.currentValue = n_57_17_OUTS_0

n_59_17_OUTS_0 = +(n_0_63_OUTS_0 >= n_59_17_STATE.floatInputs.get(1))

    n_59_1_STATE.currentValue = n_59_17_OUTS_0

n_61_17_OUTS_0 = +(n_0_63_OUTS_0 >= n_61_17_STATE.floatInputs.get(1))

    n_61_1_STATE.currentValue = n_61_17_OUTS_0

n_63_17_OUTS_0 = +(n_0_63_OUTS_0 >= n_63_17_STATE.floatInputs.get(1))

    n_63_1_STATE.currentValue = n_63_17_OUTS_0


        n_52_15_OUTS_0 = n_52_15_STATE.phase % 1
        n_52_15_STATE.phase += (n_52_15_STATE.J * m_n_52_15_0_sig_STATE.currentValue)
    

    n_52_14_STATE.signalMemory = n_52_14_OUTS_0 = n_52_15_OUTS_0 < n_52_14_STATE.controlMemory ? n_0_63_OUTS_0: n_52_14_STATE.signalMemory
    n_52_14_STATE.controlMemory = n_52_15_OUTS_0


        setSignalBus(n_10_13_STATE.busName, n_52_14_OUTS_0)
    

        n_39_15_OUTS_0 = n_39_15_STATE.phase % 1
        n_39_15_STATE.phase += (n_39_15_STATE.J * m_n_39_15_0_sig_STATE.currentValue)
    

    n_39_14_STATE.signalMemory = n_39_14_OUTS_0 = n_39_15_OUTS_0 < n_39_14_STATE.controlMemory ? n_0_61_OUTS_0: n_39_14_STATE.signalMemory
    n_39_14_STATE.controlMemory = n_39_15_OUTS_0


        setSignalBus(n_11_7_STATE.busName, n_39_14_OUTS_0)
    

        n_26_15_OUTS_0 = n_26_15_STATE.phase % 1
        n_26_15_STATE.phase += (n_26_15_STATE.J * m_n_26_15_0_sig_STATE.currentValue)
    

    n_26_14_STATE.signalMemory = n_26_14_OUTS_0 = n_26_15_OUTS_0 < n_26_14_STATE.controlMemory ? n_0_59_OUTS_0: n_26_14_STATE.signalMemory
    n_26_14_STATE.controlMemory = n_26_15_OUTS_0


        setSignalBus(n_12_7_STATE.busName, n_26_14_OUTS_0)
    

        n_65_15_OUTS_0 = Math.cos(n_65_15_STATE.phase)
        n_65_15_STATE.phase += (n_65_15_STATE.J * m_n_65_15_0_sig_STATE.currentValue)
    

        n_65_6_OUTS_0 = Math.cos(n_65_6_STATE.phase)
        n_65_6_STATE.phase += (n_65_6_STATE.J * m_n_65_6_0_sig_STATE.currentValue)
    

    n_65_4_OUTS_0 = n_65_4_STATE.currentValue
    if (toFloat(FRAME) < n_65_4_STATE.currentLine.p1.x) {
        n_65_4_STATE.currentValue += n_65_4_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_65_4_STATE.currentLine.p1.x) {
            n_65_4_STATE.currentValue = n_65_4_STATE.currentLine.p1.y
        }
    }

n_65_2_OUTS_0 = Math.cos((n_65_15_OUTS_0 + (n_65_6_OUTS_0 * n_65_4_OUTS_0)) * 2 * Math.PI)

        setSignalBus(n_65_0_STATE.busName, n_65_2_OUTS_0)
    

        n_65_10_OUTS_0 = n_65_10_STATE.phase % 1
        n_65_10_STATE.phase += (n_65_10_STATE.J * m_n_65_10_0_sig_STATE.currentValue)
    

    n_65_7_STATE.signalMemory = n_65_7_OUTS_0 = n_65_10_OUTS_0 < n_65_7_STATE.controlMemory ? n_65_2_OUTS_0: n_65_7_STATE.signalMemory
    n_65_7_STATE.controlMemory = n_65_10_OUTS_0


    n_65_8_STATE.currentValue = ((n_65_7_OUTS_0 + m_n_65_25_1_sig_STATE.currentValue) * m_n_65_26_1_sig_STATE.currentValue)

n_66_17_OUTS_0 = +(n_65_10_OUTS_0 >= n_66_17_STATE.floatInputs.get(1))

    n_66_1_STATE.currentValue = n_66_17_OUTS_0

            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    
                },
                messageSenders: {
                    
                },
            }
        }

        
exports.commons_getArray = commons_getArray
exports.commons_setArray = commons_setArray
    