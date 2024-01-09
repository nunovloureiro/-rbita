
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

function msg_isAction(message, action) {
            return msg_isMatching(message, [MSG_STRING_TOKEN])
                && msg_readStringToken(message, 0) === action
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

function n_random_setMaxValue(state, maxValue) {
        state.maxValue = Math.max(maxValue, 0)
    }

function n_add_setLeft(state, value) {
                    state.leftOp = value
                }
function n_add_setRight(state, value) {
                    state.rightOp = value
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

function n_osc_t_setPhase(state, phase) {
            state.phase = phase % 1.0 * 2 * Math.PI
        }
        
function n_0_3_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_3_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_3", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_4_RCVS_0(n_0_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_4_RCVS_0(m) {
                                
        if (!msg_isBang(m)) {
            for (let i = 0; i < msg_getLength(m); i++) {
                n_0_4_STATE.stringValues[i] = messageTokenToString(m, i)
                n_0_4_STATE.floatValues[i] = messageTokenToFloat(m, i)
            }
        }

        const template = [MSG_FLOAT_TOKEN,MSG_FLOAT_TOKEN]

        const messageOut = msg_create(template)

        msg_writeFloatToken(messageOut, 0, n_0_4_STATE.floatValues[0])
msg_writeFloatToken(messageOut, 1, n_0_4_STATE.floatValues[1])

        n_4_3_RCVS_0(messageOut)
        return
    
                                throw new Error('[pack], id "n_0_4", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_0_4_RCVS_1(m) {
                                
                    n_0_4_STATE.floatValues[1] = messageTokenToFloat(m, 0)
                    return
                
                                throw new Error('[pack], id "n_0_4", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_4_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_3_STATE.outTemplates[0])
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
                n_4_3_STATE.outMessages[0] = message
                n_4_3_STATE.messageTransferFunctions.splice(0, n_4_3_STATE.messageTransferFunctions.length - 1)
                n_4_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_3_STATE.messageTransferFunctions.length; i++) {
                    n_4_0_RCVS_0(n_4_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_3", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_4_0_OUTS_0 = 0
function n_4_0_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_4_0_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_4_0_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_4_0_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_4_0", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_1_6_SNDS_0(n_1_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_6", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_1_0_OUTS_0 = 0
function n_1_0_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_1_0_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_1_0_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_1_0_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_1_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_4_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_1_4_STATE, m)
            return
        
                                throw new Error('[bang], id "n_1_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_5_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_1_5_STATE, 
                            () => n_1_7_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_1_5_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_1_5_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_1_5_STATE,
                        () => n_1_7_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_1_5_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_1_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_7_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_1_8_RCVS_0(msg_floats([Math.floor(Math.random() * n_1_7_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_1_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_8_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_1_8_STATE, msg_readFloatToken(m, 0))
                    n_1_10_RCVS_0(msg_floats([n_1_8_STATE.leftOp + n_1_8_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_1_10_RCVS_0(msg_floats([n_1_8_STATE.leftOp + n_1_8_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_1_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_1_10_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                n_float_int_setValueFloat(n_1_10_STATE, msg_readFloatToken(m, 0))
                n_1_9_RCVS_0(msg_floats([n_1_10_STATE.value]))
                return 

            } else if (msg_isBang(m)) {
                n_1_9_RCVS_0(msg_floats([n_1_10_STATE.value]))
                return
                
            }
        
                                throw new Error('[float], id "n_1_10", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_1_3_RCVS_0(n_1_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_9", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_1_0_RCVS_0(n_1_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_1_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_7_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_7_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_22_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_6_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_22_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_22", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_6_RCVS_0(m) {
                                
                if (n_0_6_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_6_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_6_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_6_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_6_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_26_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_6_STATE.stringFilter
                    ) {
                        n_0_26_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_6_STATE.floatFilter
                ) {
                    n_0_26_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_26_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_0_26_STATE, 
                            () => n_0_8_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_0_26_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_0_26_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_0_26_STATE,
                        () => n_0_8_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_0_26_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_0_26", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_8_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_8_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_16_RCVS_0(m) {
                                
        n_0_12_RCVS_0(msg_bang())
n_0_35_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_0_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_35_RCVS_0(m) {
                                
            msgBusPublish(n_0_35_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_35", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_12_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_18_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_12_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_18_RCVS_0(m) {
                                
        n_0_18_SNDS_1(msg_bang())
n_0_13_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_18", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_13_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_0_13_STATE, msg_readFloatToken(m, 0))
                    n_0_14_RCVS_0(msg_floats([n_0_13_STATE.leftOp + n_0_13_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_0_14_RCVS_0(msg_floats([n_0_13_STATE.leftOp + n_0_13_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_14_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_14_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_14_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_14_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_14_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_14_STATE.outTemplates[0])
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
                n_0_14_STATE.outMessages[0] = message
                n_0_14_STATE.messageTransferFunctions.splice(0, n_0_14_STATE.messageTransferFunctions.length - 1)
                n_0_14_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_14_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_14_STATE.messageTransferFunctions.length; i++) {
                    n_0_15_RCVS_0(n_0_14_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_14", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_0_15_OUTS_0 = 0
function n_0_15_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_0_15_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_0_15_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_0_15_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_0_15", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_1_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_1_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_1_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_1_STATE.outTemplates[0])
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
                n_3_1_STATE.outMessages[0] = message
                n_3_1_STATE.messageTransferFunctions.splice(0, n_3_1_STATE.messageTransferFunctions.length - 1)
                n_3_1_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_1_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_1_STATE.messageTransferFunctions.length; i++) {
                    n_3_0_RCVS_0(n_3_1_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_1", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_3_0_OUTS_0 = 0
function n_3_0_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_3_0_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_3_0_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_3_0_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_3_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_5_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_5_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_5_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_5_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_5_STATE.outTemplates[0])
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
                n_3_5_STATE.outMessages[0] = message
                n_3_5_STATE.messageTransferFunctions.splice(0, n_3_5_STATE.messageTransferFunctions.length - 1)
                n_3_5_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_5_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_5_STATE.messageTransferFunctions.length; i++) {
                    n_3_0_RCVS_0(n_3_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_34_RCVS_0(m) {
                                
            msgBusPublish(n_0_34_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_34", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_25_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_0_25_STATE, 
                            () => n_0_22_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_0_25_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_0_25_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_0_25_STATE,
                        () => n_0_22_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_0_25_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_0_25", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_2_RCVS_0(n_0_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_29", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_2_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_0_2_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "n_0_2", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_0_21_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_20_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_21_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_21", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_20_RCVS_0(m) {
                                
        n_0_38_RCVS_0(msg_bang())
n_0_5_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_0_20", inlet "0", unsupported message : ' + msg_display(m))
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
                        n_0_7_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_5_STATE.stringFilter
                    ) {
                        n_0_7_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_5_STATE.floatFilter
                ) {
                    n_0_7_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_38_RCVS_0(m) {
                                
            msgBusPublish(n_0_38_STATE.busName, m)
            return
        
                                throw new Error('[send], id "n_0_38", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_23_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_24_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_23_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_23", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_24_RCVS_0(m) {
                                
                if (n_0_24_STATE.filterType === MSG_STRING_TOKEN) {
                    if (
                        (n_0_24_STATE.stringFilter === 'float'
                            && msg_isFloatToken(m, 0))
                        || (n_0_24_STATE.stringFilter === 'symbol'
                            && msg_isStringToken(m, 0))
                        || (n_0_24_STATE.stringFilter === 'list'
                            && msg_getLength(m) > 1)
                        || (n_0_24_STATE.stringFilter === 'bang' 
                            && msg_isBang(m))
                    ) {
                        n_0_25_RCVS_0(m)
                        return
                    
                    } else if (
                        msg_isStringToken(m, 0)
                        && msg_readStringToken(m, 0) === n_0_24_STATE.stringFilter
                    ) {
                        n_0_25_RCVS_0(msg_emptyToBang(msg_shift(m)))
                        return
                    }

                } else if (
                    msg_isFloatToken(m, 0)
                    && msg_readFloatToken(m, 0) === n_0_24_STATE.floatFilter
                ) {
                    n_0_25_RCVS_0(msg_emptyToBang(msg_shift(m)))
                    return
                }
            
                SND_TO_NULL(m)
            return
            
                                throw new Error('[route], id "n_0_24", inlet "0", unsupported message : ' + msg_display(m))
                            }







function n_3_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_2_STATE.outTemplates[0])
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
                n_3_2_STATE.outMessages[0] = message
                n_3_2_STATE.messageTransferFunctions.splice(0, n_3_2_STATE.messageTransferFunctions.length - 1)
                n_3_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_2_STATE.messageTransferFunctions.length; i++) {
                    n_3_3_RCVS_0(n_3_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_3_3_OUTS_0 = 0
function n_3_3_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_3_3_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_3_3_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_3_3_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_3_3", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_3_3_RCVS_0(n_3_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_4", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_2_0_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_2_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_2_0_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_2_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_1_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_2_5_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_2_4_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_2_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_2_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_2_1", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_4_RCVS_1(n_2_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_2_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_2_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_2_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_2_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_2_4_STATE.outTemplates[0])
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
                n_2_4_STATE.outMessages[0] = message
                n_2_4_STATE.messageTransferFunctions.splice(0, n_2_4_STATE.messageTransferFunctions.length - 1)
                n_2_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_2_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_2_4_STATE.messageTransferFunctions.length; i++) {
                    n_0_4_RCVS_1(n_2_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_2_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_2_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_2_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_2_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_2_2_STATE.outTemplates[0])
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
                n_2_2_STATE.outMessages[0] = message
                n_2_2_STATE.messageTransferFunctions.splice(0, n_2_2_STATE.messageTransferFunctions.length - 1)
                n_2_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_2_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_2_2_STATE.messageTransferFunctions.length; i++) {
                    n_0_4_RCVS_1(n_2_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_2", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_2_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_2_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_2_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_2_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_2_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_2_3_STATE.outTemplates[0])
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
                n_2_3_STATE.outMessages[0] = message
                n_2_3_STATE.messageTransferFunctions.splice(0, n_2_3_STATE.messageTransferFunctions.length - 1)
                n_2_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_2_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_2_3_STATE.messageTransferFunctions.length; i++) {
                    n_0_4_RCVS_1(n_2_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_2_3", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_4_1_OUTS_0 = 0









let n_0_1_OUTS_0 = 0

let n_1_1_OUTS_0 = 0











let n_0_11_OUTS_0 = 0







function n_0_3_SNDS_0(m) {
                    n_0_9_RCVS_0(m)
n_1_6_RCVS_0(m)
                }




function n_1_6_SNDS_0(m) {
                    n_1_0_RCVS_0(m)
n_1_4_RCVS_0(m)
                }








function n_0_7_SNDS_0(m) {
                    n_0_22_RCVS_0(m)
n_0_34_RCVS_0(m)
                }







function n_0_18_SNDS_1(m) {
                    n_3_1_RCVS_0(m)
n_3_5_RCVS_0(m)
                }











function n_0_30_SNDS_0(m) {
                    n_0_21_RCVS_0(m)
n_0_23_RCVS_0(m)
                }








function n_0_39_SNDS_0(m) {
                    n_3_2_RCVS_0(m)
n_3_4_RCVS_0(m)
                }



























        

        function ioRcv_n_0_3_0(m) {n_0_3_RCVS_0(m)}
function ioRcv_n_0_7_0(m) {n_0_7_RCVS_0(m)}
function ioRcv_n_0_8_0(m) {n_0_8_RCVS_0(m)}
function ioRcv_n_0_9_0(m) {n_0_9_RCVS_0(m)}
function ioRcv_n_0_14_0(m) {n_0_14_RCVS_0(m)}
function ioRcv_n_0_29_0(m) {n_0_29_RCVS_0(m)}
        

        
        const n_0_3_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_3_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_3_STATE, m)
            }
            n_0_3_STATE.messageSender = n_0_3_SNDS_0
            n_control_setReceiveBusName(n_0_3_STATE, "empty")
        })

        
    

        const n_0_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_9_STATE.outTemplates[0] = []
            
                n_0_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_9_STATE.outMessages[0] = msg_create(n_0_9_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_9_STATE.outMessages[0], 0, 10000)
            
        
        
        n_0_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_4_STATE = {
            floatValues: [0,0],
            stringValues: ["",""]
        }
    

        const n_4_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_4_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_4_3_STATE.outTemplates[0] = []
            
                n_4_3_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 1))
                if (msg_isStringToken(inMessage, 1)) {
                    stringMem[0] = msg_readStringToken(inMessage, 1)
                    n_4_3_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_4_3_STATE.outMessages[0] = msg_create(n_4_3_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 1)) {
                    msg_writeFloatToken(n_4_3_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 1))
                } else if (msg_isStringToken(inMessage, 1)) {
                    msg_writeStringToken(n_4_3_STATE.outMessages[0], 0, stringMem[0])
                }
            
        
                    return n_4_3_STATE.outMessages[0]
                }
,
function (inMessage) {
                    
            
            
            let stringMem = []
            n_4_3_STATE.outTemplates[1] = []
            
                n_4_3_STATE.outTemplates[1].push(MSG_FLOAT_TOKEN)
            

                n_4_3_STATE.outTemplates[1].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_4_3_STATE.outTemplates[1].push(stringMem[0].length)
                }
            
            n_4_3_STATE.outMessages[1] = msg_create(n_4_3_STATE.outTemplates[1])
            
                msg_writeFloatToken(n_4_3_STATE.outMessages[1], 0, 0)
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_4_3_STATE.outMessages[1], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_4_3_STATE.outMessages[1], 1, stringMem[0])
                }
            
        
                    return n_4_3_STATE.outMessages[1]
                }
,
        ]
    

        const n_4_0_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_1_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_1_6_STATE.outTemplates[0] = []
            
                n_1_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_1_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_1_6_STATE.outMessages[0] = msg_create(n_1_6_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_6_STATE.outMessages[0], 0, 0.9)
            

                msg_writeFloatToken(n_1_6_STATE.outMessages[0], 1, 50)
            
        
        
        n_1_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_1_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_0_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_1_4_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_1_4_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_1_4_STATE, m)
            }
            n_1_4_STATE.messageSender = n_1_5_RCVS_0
            n_control_setReceiveBusName(n_1_4_STATE, "empty")
        })

        
    

        const n_1_5_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_1_5_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_1_5_STATE, 100)
        })
    

        const n_1_7_STATE = {
            maxValue: 15000
        }
    

        const n_1_8_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_1_8_STATE, 0)
            n_add_setRight(n_1_8_STATE, 5000)
        

            const n_1_10_STATE = {
                value: 0,
            }
            n_float_int_setValueFloat(n_1_10_STATE, 0)
        

        const n_1_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_1_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_1_9_STATE.outTemplates[0] = []
            
                n_1_9_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_1_9_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_1_9_STATE.outMessages[0] = msg_create(n_1_9_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_1_9_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_1_9_STATE.outMessages[0], 0, stringMem[0])
                }
            
        
                    return n_1_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_1_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_1_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_1_3_STATE.outTemplates[0] = []
            
                n_1_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_1_3_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_1_3_STATE.outTemplates[0].push(stringMem[0].length)
                }
            
            n_1_3_STATE.outMessages[0] = msg_create(n_1_3_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_1_3_STATE.outMessages[0], 0, 0)
            

                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_1_3_STATE.outMessages[0], 1, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_1_3_STATE.outMessages[0], 1, stringMem[0])
                }
            
        
                    return n_1_3_STATE.outMessages[0]
                }
,
        ]
    

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
            n_0_7_STATE.messageSender = n_0_7_SNDS_0
            n_control_setReceiveBusName(n_0_7_STATE, "empty")
        })

        
    

        const n_0_22_STATE = {
            maxValue: 3
        }
    

        const n_0_6_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_0_26_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_26_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_0_26_STATE, 1000)
        })
    

        const n_0_8_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_8_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_8_STATE, m)
            }
            n_0_8_STATE.messageSender = n_0_16_RCVS_0
            n_control_setReceiveBusName(n_0_8_STATE, "empty")
        })

        
    


            const n_0_35_STATE = {
                busName: "wobbleBang",
            }
        

        const n_0_12_STATE = {
            maxValue: 7
        }
    


        const n_0_13_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_0_13_STATE, 0)
            n_add_setRight(n_0_13_STATE, 3)
        

        const n_0_14_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_0_14_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_0_14_STATE.outTemplates[0] = []
            
                n_0_14_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_14_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_0_14_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_14_STATE.outMessages[0] = msg_create(n_0_14_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_14_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_14_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_0_14_STATE.outMessages[0], 1, 10)
            
        
                    return n_0_14_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_15_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_3_1_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_3_1_STATE.outTemplates[0] = []
            
                n_3_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_3_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_1_STATE.outMessages[0] = msg_create(n_3_1_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_3_1_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_3_1_STATE.outMessages[0], 1, 10)
            
        
        
        n_3_1_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_3_1_STATE.outMessages[0]
                }
,
        ]
    

        const n_3_0_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_3_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_3_5_STATE.outTemplates[0] = []
            
                n_3_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_3_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_5_STATE.outMessages[0] = msg_create(n_3_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_3_5_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_3_5_STATE.outMessages[0], 1, 10)
            
        
        
        n_3_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_3_5_STATE.outMessages[0]
                }
,
        ]
    

            const n_0_34_STATE = {
                busName: "kickBang",
            }
        

        const n_0_25_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_25_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_0_25_STATE, 2000)
        })
    
commons_waitFrame(0, () => n_0_29_RCVS_0(msg_bang()))

        const n_0_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_29_STATE.outTemplates[0] = []
            
                n_0_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_29_STATE.outMessages[0] = msg_create(n_0_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_29_STATE.outMessages[0], 0, 45)
            
        
        
        n_0_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_29_STATE.outMessages[0]
                }
,
        ]
    

            const n_0_2_STATE = {
                currentValue: 0
            }
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("bassTrig", n_0_30_SNDS_0)
            })
        

        const n_0_21_STATE = {
            maxValue: 5
        }
    


        const n_0_5_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

            const n_0_38_STATE = {
                busName: "kickEnvBang",
            }
        

        const n_0_23_STATE = {
            maxValue: 3
        }
    

        const n_0_24_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("kickBang", n_0_3_RCVS_0)
            })
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("wobbleBang", n_0_3_RCVS_0)
            })
        

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("kickEnvBang", n_0_39_SNDS_0)
            })
        

        const n_3_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_3_2_STATE.outTemplates[0] = []
            
                n_3_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_3_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_2_STATE.outMessages[0] = msg_create(n_3_2_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_3_2_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_3_2_STATE.outMessages[0], 1, 10)
            
        
        
        n_3_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_3_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_3_3_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_3_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_3_4_STATE.outTemplates[0] = []
            
                n_3_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_3_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_4_STATE.outMessages[0] = msg_create(n_3_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_3_4_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_3_4_STATE.outMessages[0], 1, 10)
            
        
        
        n_3_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_3_4_STATE.outMessages[0]
                }
,
        ]
    

            commons_waitEngineConfigure(() => {
                msgBusSubscribe("kickEnvBang", n_2_0_RCVS_0)
            })
        

        const n_2_0_STATE = {
            maxValue: 4
        }
    

        const n_2_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_2_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_5_STATE.outTemplates[0] = []
            
                n_2_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_5_STATE.outMessages[0] = msg_create(n_2_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_5_STATE.outMessages[0], 0, 2.1)
            
        
        
        n_2_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_5_STATE.outMessages[0]
                }
,
        ]
    

        const n_2_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_4_STATE.outTemplates[0] = []
            
                n_2_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_4_STATE.outMessages[0] = msg_create(n_2_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_4_STATE.outMessages[0], 0, 1.5)
            
        
        
        n_2_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_2_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_2_STATE.outTemplates[0] = []
            
                n_2_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_2_STATE.outMessages[0] = msg_create(n_2_2_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_2_STATE.outMessages[0], 0, 1.8)
            
        
        
        n_2_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_2_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_2_3_STATE.outTemplates[0] = []
            
                n_2_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_2_3_STATE.outMessages[0] = msg_create(n_2_3_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_2_3_STATE.outMessages[0], 0, 2)
            
        
        
        n_2_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_2_3_STATE.outMessages[0]
                }
,
        ]
    



        const n_0_44_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_44_STATE, "wobbleSelecta")
    



            const n_0_1_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_1_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        




            const m_n_0_45_1_sig_STATE = {
                currentValue: 0.35
            }
        


        const n_0_41_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_41_STATE, "bus_bass")
    

            const n_0_11_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_11_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        



        const n_0_43_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_43_STATE, "wobbleSelecta")
    

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_3":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[779,198]}},"n_0_7":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[292,302]}},"n_0_8":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[188,393]}},"n_0_9":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[562,356]}},"n_0_14":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[203,539]}},"n_0_29":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[664,517]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_3":{"0":"ioRcv_n_0_3_0"},"n_0_7":{"0":"ioRcv_n_0_7_0"},"n_0_8":{"0":"ioRcv_n_0_8_0"},"n_0_9":{"0":"ioRcv_n_0_9_0"},"n_0_14":{"0":"ioRcv_n_0_14_0"},"n_0_29":{"0":"ioRcv_n_0_29_0"}},"messageSenders":{}}}}},
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
            
    n_4_0_OUTS_0 = n_4_0_STATE.currentValue
    if (toFloat(FRAME) < n_4_0_STATE.currentLine.p1.x) {
        n_4_0_STATE.currentValue += n_4_0_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_4_0_STATE.currentLine.p1.x) {
            n_4_0_STATE.currentValue = n_4_0_STATE.currentLine.p1.y
        }
    }

n_4_1_OUTS_0 = n_4_0_OUTS_0 * n_4_0_OUTS_0

        n_0_1_OUTS_0 = Math.cos(n_0_1_STATE.phase)
        n_0_1_STATE.phase += (n_0_1_STATE.J * (((n_4_1_OUTS_0 * n_4_1_OUTS_0) * readSignalBus(n_0_44_STATE.busName)) + n_0_2_STATE.currentValue))
    

    n_1_0_OUTS_0 = n_1_0_STATE.currentValue
    if (toFloat(FRAME) < n_1_0_STATE.currentLine.p1.x) {
        n_1_0_STATE.currentValue += n_1_0_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_1_0_STATE.currentLine.p1.x) {
            n_1_0_STATE.currentValue = n_1_0_STATE.currentLine.p1.y
        }
    }

n_1_1_OUTS_0 = n_1_0_OUTS_0 * n_1_0_OUTS_0

        setSignalBus(n_0_41_STATE.busName, ((n_0_1_OUTS_0 * (n_1_1_OUTS_0 * n_1_1_OUTS_0)) * m_n_0_45_1_sig_STATE.currentValue))
    

    n_0_15_OUTS_0 = n_0_15_STATE.currentValue
    if (toFloat(FRAME) < n_0_15_STATE.currentLine.p1.x) {
        n_0_15_STATE.currentValue += n_0_15_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_0_15_STATE.currentLine.p1.x) {
            n_0_15_STATE.currentValue = n_0_15_STATE.currentLine.p1.y
        }
    }


        n_0_11_OUTS_0 = Math.cos(n_0_11_STATE.phase)
        n_0_11_STATE.phase += (n_0_11_STATE.J * n_0_15_OUTS_0)
    

    n_3_0_OUTS_0 = n_3_0_STATE.currentValue
    if (toFloat(FRAME) < n_3_0_STATE.currentLine.p1.x) {
        n_3_0_STATE.currentValue += n_3_0_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_3_0_STATE.currentLine.p1.x) {
            n_3_0_STATE.currentValue = n_3_0_STATE.currentLine.p1.y
        }
    }


    n_3_3_OUTS_0 = n_3_3_STATE.currentValue
    if (toFloat(FRAME) < n_3_3_STATE.currentLine.p1.x) {
        n_3_3_STATE.currentValue += n_3_3_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_3_3_STATE.currentLine.p1.x) {
            n_3_3_STATE.currentValue = n_3_3_STATE.currentLine.p1.y
        }
    }


        setSignalBus(n_0_43_STATE.busName, ((n_0_11_OUTS_0 * n_3_0_OUTS_0) + n_3_3_OUTS_0))
    
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_3: {
                            "0": ioRcv_n_0_3_0,
                        },
n_0_7: {
                            "0": ioRcv_n_0_7_0,
                        },
n_0_8: {
                            "0": ioRcv_n_0_8_0,
                        },
n_0_9: {
                            "0": ioRcv_n_0_9_0,
                        },
n_0_14: {
                            "0": ioRcv_n_0_14_0,
                        },
n_0_29: {
                            "0": ioRcv_n_0_29_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        

    