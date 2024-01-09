
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

function n_add_setLeft(state, value) {
                    state.leftOp = value
                }
function n_add_setRight(state, value) {
                    state.rightOp = value
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

function n_line_setNewLine(state, targetValue) {
        state.currentLine = {
            p0: {
                x: toFloat(FRAME), 
                y: state.currentValue,
            }, 
            p1: {
                x: toFloat(FRAME) + state.nextDurationSamp, 
                y: targetValue,
            }, 
            dx: state.grainSamp
        }
        state.nextDurationSamp = 0
        state.currentLine.dy = computeSlope(state.currentLine.p0, state.currentLine.p1) * state.grainSamp
    }
function n_line_setNextDuration(state, durationMsec) {
        state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
    }
function n_line_setGrain(state, grainMsec) {
        state.grainSamp = computeUnitInSamples(SAMPLE_RATE, Math.max(grainMsec, 20), 'msec')
    }
function n_line_stopCurrentLine(state) {
        if (state.skedId !== SKED_ID_NULL) {
            commons_cancelWaitFrame(state.skedId)
            state.skedId = SKED_ID_NULL
        }
        if (FRAME < state.nextSampInt) {
            n_line_incrementTime(state, -1 * (state.nextSamp - toFloat(FRAME)))
        }
        n_line_setNextSamp(state, -1)
    }
function n_line_setNextSamp(state, currentSamp) {
        state.nextSamp = currentSamp
        state.nextSampInt = toInt(Math.round(currentSamp))
    }
function n_line_incrementTime(state, incrementSamp) {
        if (incrementSamp === state.currentLine.dx) {
            state.currentValue += state.currentLine.dy
        } else {
            state.currentValue += interpolateLin(
                incrementSamp,
                {x: 0, y: 0},
                {x: state.currentLine.dx, y: state.currentLine.dy},
            )
        }
        n_line_setNextSamp(
            state, 
            (state.nextSamp !== -1 ? state.nextSamp: toFloat(FRAME)) + incrementSamp
        )
    }
function n_line_tick(state) {
        state.snd0(msg_floats([state.currentValue]))
        if (toFloat(FRAME) >= state.currentLine.p1.x) {
            state.currentValue = state.currentLine.p1.y
            n_line_stopCurrentLine(state)
        } else {
            n_line_incrementTime(state, state.currentLine.dx)
            n_line_scheduleNextTick(state)
        }
    }
function n_line_scheduleNextTick(state) {
        state.skedId = commons_waitFrame(state.nextSampInt, state.tickCallback)
    }

function n_sub_setLeft(state, value) {
                    state.leftOp = value
                }
function n_sub_setRight(state, value) {
                    state.rightOp = value
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


function buf_clear(buffer) {
        buffer.data.fill(0)
    }
function buf_create(length) {
        return {
            data: createFloatArray(length),
            length: length,
            writeCursor: 0,
            pullAvailableLength: 0,
        }
    }
const DELAY_BUFFERS = new Map()
const DELAY_BUFFERS_SKEDULER = sked_create(true)
const DELAY_BUFFERS_NULL = buf_create(1)
function DELAY_BUFFERS_set(delayName, buffer) {
            DELAY_BUFFERS.set(delayName, buffer)
            sked_emit(DELAY_BUFFERS_SKEDULER, delayName)
        }
function DELAY_BUFFERS_get(delayName, callback) {
            sked_wait(DELAY_BUFFERS_SKEDULER, delayName, callback)
        }
function DELAY_BUFFERS_delete(delayName) {
            DELAY_BUFFERS.delete(delayName)
        }
function buf_writeSample(buffer, value) {
            buffer.data[buffer.writeCursor] = value
            buffer.writeCursor = (buffer.writeCursor + 1) % buffer.length
        }
function buf_readSample(buffer, offset) {
            // R = (buffer.writeCursor - 1 - offset) -> ideal read position
            // W = R % buffer.length -> wrap it so that its within buffer length bounds (but could be negative)
            // (W + buffer.length) % buffer.length -> if W negative, (W + buffer.length) shifts it back to positive.
            return buffer.data[(buffer.length + ((buffer.writeCursor - 1 - offset) % buffer.length)) % buffer.length]
        }

function n_delread_setDelayName(state, delayName, callback) {
                    if (state.delayName.length) {
                        state.buffer = DELAY_BUFFERS_NULL
                    }
                    state.delayName = delayName
                    if (state.delayName.length) {
                        DELAY_BUFFERS_get(state.delayName, callback)
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


function n_lop_t_setFreq(state, freq) {
        state.coeff = Math.max(Math.min(freq * 2 * Math.PI / SAMPLE_RATE, 1), 0)
    }

function n_phasor_t_setPhase(state, phase) {
            state.phase = phase % 1.0
        }

function n_osc_t_setPhase(state, phase) {
            state.phase = phase % 1.0 * 2 * Math.PI
        }

function n_delwrite_setDelayName(state, delayName) {
                if (state.delayName.length) {
                    DELAY_BUFFERS_delete(state.delayName)
                }
                state.delayName = delayName
                if (state.delayName.length) {
                    DELAY_BUFFERS_set(state.delayName, state.buffer)
                }
            }
        


function n_0_25_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_25_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_25", inlet "0", unsupported message : ' + msg_display(m))
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
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_2_1_STATE, msg_readFloatToken(m, 0))
                    n_3_5_RCVS_0(msg_floats([n_2_1_STATE.leftOp + n_2_1_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_3_5_RCVS_0(msg_floats([n_2_1_STATE.leftOp + n_2_1_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_2_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_5_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                const newValue = msg_readFloatToken(m, 0)
                if (newValue !== n_3_5_STATE.currentValue) {
                    n_3_5_STATE.currentValue = newValue
                    n_3_16_RCVS_0(msg_floats([n_3_5_STATE.currentValue]))
                }
                return
    
            } else if (msg_isBang(m)) {
                n_3_16_RCVS_0(msg_floats([n_3_5_STATE.currentValue]))
                return 
    
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_5_STATE.currentValue = msg_readFloatToken(m, 1)
                return
            }
        
                                throw new Error('[change], id "n_3_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_16_RCVS_0(m) {
                                
        n_3_6_RCVS_0(msg_bang())
n_3_8_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
n_3_9_RCVS_0(msg_floats([messageTokenToFloat(m, 0)]))
        return
    
                                throw new Error('[trigger], id "n_3_16", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_9_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_9_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_9_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_9_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_9_STATE.outTemplates[0])
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
                n_3_9_STATE.outMessages[0] = message
                n_3_9_STATE.messageTransferFunctions.splice(0, n_3_9_STATE.messageTransferFunctions.length - 1)
                n_3_9_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_9_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_9_STATE.messageTransferFunctions.length; i++) {
                    n_3_10_RCVS_0(n_3_9_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_10_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            n_line_stopCurrentLine(n_3_10_STATE)
            switch (msg_getLength(m)) {
                case 3:
                    n_line_setGrain(n_3_10_STATE, msg_readFloatToken(m, 2))
                case 2:
                    n_line_setNextDuration(n_3_10_STATE, msg_readFloatToken(m, 1))
                case 1:
                    const targetValue = msg_readFloatToken(m, 0)
                    if (n_3_10_STATE.nextDurationSamp === 0) {
                        n_3_10_STATE.currentValue = targetValue
                        m_n_3_3_0__routemsg_RCVS_0(msg_floats([targetValue]))
                    } else {
                        m_n_3_3_0__routemsg_RCVS_0(msg_floats([n_3_10_STATE.currentValue]))
                        n_line_setNewLine(n_3_10_STATE, targetValue)
                        n_line_incrementTime(n_3_10_STATE, n_3_10_STATE.currentLine.dx)
                        n_line_scheduleNextTick(n_3_10_STATE)
                    }
                    
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_stopCurrentLine(n_3_10_STATE)
            return

        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_line_stopCurrentLine(n_3_10_STATE)
            n_3_10_STATE.currentValue = msg_readFloatToken(m, 1)
            return
        }
    
                                throw new Error('[line], id "n_3_10", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_3_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_3_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_3_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_3_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_3_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_3_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_8_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_add_setLeft(n_3_8_STATE, msg_readFloatToken(m, 0))
                    n_3_11_RCVS_0(msg_floats([n_3_8_STATE.leftOp + n_3_8_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_3_11_RCVS_0(msg_floats([n_3_8_STATE.leftOp + n_3_8_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[+], id "n_3_8", inlet "0", unsupported message : ' + msg_display(m))
                            }
function n_3_8_RCVS_1(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            n_add_setRight(n_3_8_STATE, msg_readFloatToken(m, 0))
            return
        }
    
                                throw new Error('[+], id "n_3_8", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_3_11_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_3_11_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_3_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_3_11_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_3_11_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_3_11_STATE.outTemplates[0])
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
                n_3_11_STATE.outMessages[0] = message
                n_3_11_STATE.messageTransferFunctions.splice(0, n_3_11_STATE.messageTransferFunctions.length - 1)
                n_3_11_STATE.messageTransferFunctions[0] = function (m) {
                    return n_3_11_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_3_11_STATE.messageTransferFunctions.length; i++) {
                    n_3_12_RCVS_0(n_3_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_3_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_12_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            n_line_stopCurrentLine(n_3_12_STATE)
            switch (msg_getLength(m)) {
                case 3:
                    n_line_setGrain(n_3_12_STATE, msg_readFloatToken(m, 2))
                case 2:
                    n_line_setNextDuration(n_3_12_STATE, msg_readFloatToken(m, 1))
                case 1:
                    const targetValue = msg_readFloatToken(m, 0)
                    if (n_3_12_STATE.nextDurationSamp === 0) {
                        n_3_12_STATE.currentValue = targetValue
                        m_n_3_15_0__routemsg_RCVS_0(msg_floats([targetValue]))
                    } else {
                        m_n_3_15_0__routemsg_RCVS_0(msg_floats([n_3_12_STATE.currentValue]))
                        n_line_setNewLine(n_3_12_STATE, targetValue)
                        n_line_incrementTime(n_3_12_STATE, n_3_12_STATE.currentLine.dx)
                        n_line_scheduleNextTick(n_3_12_STATE)
                    }
                    
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_stopCurrentLine(n_3_12_STATE)
            return

        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_line_stopCurrentLine(n_3_12_STATE)
            n_3_12_STATE.currentValue = msg_readFloatToken(m, 1)
            return
        }
    
                                throw new Error('[line], id "n_3_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_15_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_3_15_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_3_15_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_3_15_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_3_15_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_3_15_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_6_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_3_7_RCVS_0(msg_floats([Math.floor(Math.random() * n_3_6_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_3_6", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_3_7_RCVS_0(m) {
                                
                if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                    n_sub_setLeft(n_3_7_STATE, msg_readFloatToken(m, 0))
                    n_3_8_RCVS_1(msg_floats([n_3_7_STATE.leftOp - n_3_7_STATE.rightOp]))
                    return
                
                } else if (msg_isBang(m)) {
                    n_3_8_RCVS_1(msg_floats([n_3_7_STATE.leftOp - n_3_7_STATE.rightOp]))
                    return
                }
            
                                throw new Error('[-], id "n_3_7", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_31_RCVS_0(m) {
                                
            if (msg_getLength(m) === 1) {
                if (msg_isStringToken(m, 0)) {
                    const action = msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        n_delay_scheduleDelay(
                            n_0_31_STATE, 
                            () => n_0_29_RCVS_0(msg_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        n_delay_stop(n_0_31_STATE)
                        return
                    }
                    
                } else if (msg_isFloatToken(m, 0)) {
                    n_delay_setDelay(n_0_31_STATE, msg_readFloatToken(m, 0))
                    n_delay_scheduleDelay(
                        n_0_31_STATE,
                        () => n_0_29_RCVS_0(msg_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN, MSG_STRING_TOKEN])
                && msg_readStringToken(m, 0) === 'tempo'
            ) {
                n_0_31_STATE.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    msg_readFloatToken(m, 1), 
                    msg_readStringToken(m, 2)
                )
                return
            }
        
                                throw new Error('[delay], id "n_0_31", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_29_SNDS_0(n_0_29_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_29", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_0_28_OUTS_0 = 0
function n_0_28_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_0_28_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_0_28_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_0_28_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_0_28", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_42_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_42_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_42", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_9_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_6_9_STATE, m)
            return
        
                                throw new Error('[bang], id "n_6_9", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_2_STATE.outTemplates[0])
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
                n_6_2_STATE.outMessages[0] = message
                n_6_2_STATE.messageTransferFunctions.splice(0, n_6_2_STATE.messageTransferFunctions.length - 1)
                n_6_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_2_STATE.messageTransferFunctions.length; i++) {
                    n_6_0_RCVS_0(n_6_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_2", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_6_0_OUTS_0 = 0
function n_6_0_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_6_0_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_6_0_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_6_0_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_6_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_3_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_3_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_3_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_3_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_3_STATE.outTemplates[0])
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
                n_5_3_STATE.outMessages[0] = message
                n_5_3_STATE.messageTransferFunctions.splice(0, n_5_3_STATE.messageTransferFunctions.length - 1)
                n_5_3_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_3_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_3_STATE.messageTransferFunctions.length; i++) {
                    n_5_0_RCVS_0(n_5_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_3", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_5_0_OUTS_0 = 0
function n_5_0_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_5_0_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_5_0_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_5_0_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_5_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_32_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_0_32_STATE, m)
            return
        
                                throw new Error('[bang], id "n_0_32", inlet "0", unsupported message : ' + msg_display(m))
                            }



function n_0_47_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_47_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_47_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_47_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_47_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_47_STATE.outTemplates[0])
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
                n_0_47_STATE.outMessages[0] = message
                n_0_47_STATE.messageTransferFunctions.splice(0, n_0_47_STATE.messageTransferFunctions.length - 1)
                n_0_47_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_47_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_47_STATE.messageTransferFunctions.length; i++) {
                    n_7_17_RCVS_1(n_0_47_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_47", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_7_17_OUTS_0 = 0
function n_7_17_RCVS_1(m) {
                                
                            n_7_17_STATE.floatInputs.set(1, messageTokenToFloat(m, 0))
                            return
                        
                                throw new Error('[expr~], id "n_7_17", inlet "1", unsupported message : ' + msg_display(m))
                            }

function n_6_8_RCVS_0(m) {
                                
            n_bang_receiveMessage(n_6_8_STATE, m)
            return
        
                                throw new Error('[bang], id "n_6_8", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_6_1_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_6_1_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_6_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_6_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_6_1_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_6_1_STATE.outTemplates[0])
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
                n_6_1_STATE.outMessages[0] = message
                n_6_1_STATE.messageTransferFunctions.splice(0, n_6_1_STATE.messageTransferFunctions.length - 1)
                n_6_1_STATE.messageTransferFunctions[0] = function (m) {
                    return n_6_1_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_6_1_STATE.messageTransferFunctions.length; i++) {
                    n_6_0_RCVS_0(n_6_1_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_6_1", inlet "0", unsupported message : ' + msg_display(m))
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
n_7_3_SNDS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_7_3", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_26_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_0_30_RCVS_0(msg_floats([Math.floor(Math.random() * n_0_26_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_0_26", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_30_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_0_38_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 6
                        ) {
                            n_0_29_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_0_30", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_38_RCVS_0(m) {
                                
        n_0_38_SNDS_2(msg_bang())
n_4_0_RCVS_0(msg_bang())
n_0_27_RCVS_0(msg_bang())
        return
    
                                throw new Error('[trigger], id "n_0_38", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_27_SNDS_0(n_0_27_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_27", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_0_RCVS_0(m) {
                                
        if (msg_isBang(m)) {
            n_4_1_RCVS_0(msg_floats([Math.floor(Math.random() * n_4_0_STATE.maxValue)]))
            return
        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'seed'
        ) {
            console.log('WARNING : seed not implemented yet for [random]')
            return
        }
    
                                throw new Error('[random], id "n_4_0", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_1_RCVS_0(m) {
                                
                
                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 0
                        ) {
                            n_4_2_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 1
                        ) {
                            n_4_3_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 2
                        ) {
                            n_4_5_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                        if (
                            msg_isFloatToken(m, 0)
                            && msg_readFloatToken(m, 0) === 3
                        ) {
                            n_4_4_RCVS_0(msg_emptyToBang(msg_shift(m)))
                            return
                        }
                    

                SND_TO_NULL(m)
                return
            
                                throw new Error('[route], id "n_4_1", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_2_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_2_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_2_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_2_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_2_STATE.outTemplates[0])
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
                n_4_2_STATE.outMessages[0] = message
                n_4_2_STATE.messageTransferFunctions.splice(0, n_4_2_STATE.messageTransferFunctions.length - 1)
                n_4_2_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_2_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_2_STATE.messageTransferFunctions.length; i++) {
                    n_4_6_RCVS_0(n_4_2_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_2", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_36_RCVS_0(n_4_6_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_6", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_0_36_OUTS_0 = 0
function n_0_36_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_0_36_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_0_36_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_0_36_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_0_36", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_4_6_RCVS_0(n_4_3_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_3", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_4_6_RCVS_0(n_4_5_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_5", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_4_4_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_4_4_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_4_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_4_4_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_4_4_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_4_4_STATE.outTemplates[0])
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
                n_4_4_STATE.outMessages[0] = message
                n_4_4_STATE.messageTransferFunctions.splice(0, n_4_4_STATE.messageTransferFunctions.length - 1)
                n_4_4_STATE.messageTransferFunctions[0] = function (m) {
                    return n_4_4_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_4_4_STATE.messageTransferFunctions.length; i++) {
                    n_4_6_RCVS_0(n_4_4_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_4_4", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_5_1_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_5_1_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_5_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_5_1_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_5_1_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_5_1_STATE.outTemplates[0])
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
                n_5_1_STATE.outMessages[0] = message
                n_5_1_STATE.messageTransferFunctions.splice(0, n_5_1_STATE.messageTransferFunctions.length - 1)
                n_5_1_STATE.messageTransferFunctions[0] = function (m) {
                    return n_5_1_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_5_1_STATE.messageTransferFunctions.length; i++) {
                    n_5_0_RCVS_0(n_5_1_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_5_1", inlet "0", unsupported message : ' + msg_display(m))
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




let n_3_3_OUTS_0 = 0

let n_3_15_OUTS_0 = 0





















let n_0_1_OUTS_0 = 0



let n_1_2_OUTS_0 = 0



let n_1_3_OUTS_0 = 0



let n_1_4_OUTS_0 = 0



let n_1_5_OUTS_0 = 0



let n_0_43_OUTS_0 = 0

let n_0_35_OUTS_0 = 0













let n_3_17_OUTS_0 = 0



let n_0_14_OUTS_0 = 0



let n_0_15_OUTS_0 = 0















let n_0_11_OUTS_0 = 0



let n_0_10_OUTS_0 = 0

































function n_0_29_SNDS_0(m) {
                    n_0_28_RCVS_0(m)
n_0_42_RCVS_0(m)
n_5_3_RCVS_0(m)
                }






















function n_7_3_SNDS_0(m) {
                    n_0_25_RCVS_0(m)
n_0_26_RCVS_0(m)
                }


function n_0_38_SNDS_2(m) {
                    n_5_1_RCVS_0(m)
n_6_8_RCVS_0(m)
                }
function n_0_27_SNDS_0(m) {
                    n_0_28_RCVS_0(m)
n_0_32_RCVS_0(m)
                }









































































        

        function ioRcv_n_0_27_0(m) {n_0_27_RCVS_0(m)}
function ioRcv_n_0_29_0(m) {n_0_29_RCVS_0(m)}
function ioRcv_n_0_47_0(m) {n_0_47_RCVS_0(m)}
        

        commons_waitFrame(0, () => n_0_25_RCVS_0(msg_bang()))

        const n_0_25_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_25_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_25_STATE, m)
            }
            n_0_25_STATE.messageSender = n_2_0_RCVS_0
            n_control_setReceiveBusName(n_0_25_STATE, "empty")
        })

        
    

        const n_2_0_STATE = {
            maxValue: 800
        }
    

        const n_2_1_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_2_1_STATE, 0)
            n_add_setRight(n_2_1_STATE, 30)
        

            const n_3_5_STATE = {
                currentValue: 0
            }
        


        const n_3_9_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_3_9_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_3_9_STATE.outTemplates[0] = []
            
                n_3_9_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_3_9_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_3_9_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_9_STATE.outMessages[0] = msg_create(n_3_9_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_3_9_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_3_9_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_3_9_STATE.outMessages[0], 1, 100)
            
        
                    return n_3_9_STATE.outMessages[0]
                }
,
        ]
    

        const n_3_10_STATE = {
            currentLine: {
                p0: {x: -1, y: 0},
                p1: {x: -1, y: 0},
                dx: 1,
                dy: 0,
            },
            currentValue: 0,
            nextSamp: -1,
            nextSampInt: -1,
            grainSamp: 0,
            nextDurationSamp: 0,
            skedId: SKED_ID_NULL,
            snd0: m_n_3_3_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_line_setGrain(n_3_10_STATE, 20)
            n_3_10_STATE.tickCallback = function () {
                n_line_tick(n_3_10_STATE)
            }
        })
    


            const m_n_3_3_0_sig_STATE = {
                currentValue: 250
            }
        

        const n_3_8_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_add_setLeft(n_3_8_STATE, 0)
            n_add_setRight(n_3_8_STATE, 0)
        

        const n_3_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_3_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_3_11_STATE.outTemplates[0] = []
            
                n_3_11_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_3_11_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_3_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_3_11_STATE.outMessages[0] = msg_create(n_3_11_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_3_11_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_3_11_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_3_11_STATE.outMessages[0], 1, 100)
            
        
                    return n_3_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_3_12_STATE = {
            currentLine: {
                p0: {x: -1, y: 0},
                p1: {x: -1, y: 0},
                dx: 1,
                dy: 0,
            },
            currentValue: 0,
            nextSamp: -1,
            nextSampInt: -1,
            grainSamp: 0,
            nextDurationSamp: 0,
            skedId: SKED_ID_NULL,
            snd0: m_n_3_15_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_line_setGrain(n_3_12_STATE, 20)
            n_3_12_STATE.tickCallback = function () {
                n_line_tick(n_3_12_STATE)
            }
        })
    


            const m_n_3_15_0_sig_STATE = {
                currentValue: 250
            }
        

        const n_3_6_STATE = {
            maxValue: 50
        }
    

        const n_3_7_STATE = {
                leftOp: 0,
                rightOp: 0,
            }
            n_sub_setLeft(n_3_7_STATE, 0)
            n_sub_setRight(n_3_7_STATE, 25)
        

        const n_0_31_STATE = {
            delay: 0,
            sampleRatio: 1,
            scheduledBang: SKED_ID_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_31_STATE.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
            n_delay_setDelay(n_0_31_STATE, 6000)
        })
    

        const n_0_29_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_29_STATE.outTemplates[0] = []
            
                n_0_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_0_29_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_29_STATE.outMessages[0] = msg_create(n_0_29_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_29_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_0_29_STATE.outMessages[0], 1, 1000)
            
        
        
        n_0_29_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_29_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_28_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_0_42_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_42_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_42_STATE, m)
            }
            n_0_42_STATE.messageSender = n_6_9_RCVS_0
            n_control_setReceiveBusName(n_0_42_STATE, "empty")
        })

        
    

        const n_6_9_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_6_9_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_6_9_STATE, m)
            }
            n_6_9_STATE.messageSender = n_6_2_RCVS_0
            n_control_setReceiveBusName(n_6_9_STATE, "empty")
        })

        
    

        const n_6_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_2_STATE.outTemplates[0] = []
            
                n_6_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_6_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_6_2_STATE.outMessages[0] = msg_create(n_6_2_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_6_2_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_6_2_STATE.outMessages[0], 1, 100)
            
        
        
        n_6_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_6_0_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_5_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_5_3_STATE.outTemplates[0] = []
            
                n_5_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_5_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_5_3_STATE.outMessages[0] = msg_create(n_5_3_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_5_3_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_5_3_STATE.outMessages[0], 1, 100)
            
        
        
        n_5_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_5_3_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_0_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_0_32_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_0_32_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_0_32_STATE, m)
            }
            n_0_32_STATE.messageSender = n_0_31_RCVS_0
            n_control_setReceiveBusName(n_0_32_STATE, "empty")
        })

        
    
commons_waitFrame(0, () => n_0_47_RCVS_0(msg_bang()))

        const n_0_47_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_47_STATE.outTemplates[0] = []
            
                n_0_47_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_47_STATE.outMessages[0] = msg_create(n_0_47_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_47_STATE.outMessages[0], 0, 0.01)
            
        
        
        n_0_47_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_47_STATE.outMessages[0]
                }
,
        ]
    

        const n_7_17_STATE = {
            floatInputs: new Map(),
            stringInputs: new Map(),
            outputs: new Array(1),
        }

        n_7_17_STATE.floatInputs.set(1, 0)
        
    

        const n_6_8_STATE = {
            value: msg_create([]),
            receiveBusName: "empty",
            sendBusName: "empty",
            messageReceiver: n_control_defaultMessageHandler,
            messageSender: n_control_defaultMessageHandler,
        }
    
        commons_waitEngineConfigure(() => {
            n_6_8_STATE.messageReceiver = function (m) {
                n_bang_receiveMessage(n_6_8_STATE, m)
            }
            n_6_8_STATE.messageSender = n_6_1_RCVS_0
            n_control_setReceiveBusName(n_6_8_STATE, "empty")
        })

        
    

        const n_6_1_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_6_1_STATE.outTemplates[0] = []
            
                n_6_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_6_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_6_1_STATE.outMessages[0] = msg_create(n_6_1_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_6_1_STATE.outMessages[0], 0, 0)
            

                msg_writeFloatToken(n_6_1_STATE.outMessages[0], 1, 100)
            
        
        
        n_6_1_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_6_1_STATE.outMessages[0]
                }
,
        ]
    

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
    


        const n_0_26_STATE = {
            maxValue: 8
        }
    

        const n_0_30_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    


        const n_0_27_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_0_27_STATE.outTemplates[0] = []
            
                n_0_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_0_27_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_27_STATE.outMessages[0] = msg_create(n_0_27_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_0_27_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_0_27_STATE.outMessages[0], 1, 1000)
            
        
        
        n_0_27_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_0_27_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_0_STATE = {
            maxValue: 4
        }
    

        const n_4_1_STATE = {
            floatFilter: 0,
            stringFilter: "0",
            filterType: MSG_FLOAT_TOKEN,
        }
    

        const n_4_2_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_2_STATE.outTemplates[0] = []
            
                n_4_2_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_2_STATE.outMessages[0] = msg_create(n_4_2_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_2_STATE.outMessages[0], 0, 10)
            
        
        
        n_4_2_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_2_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_6_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_4_6_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_4_6_STATE.outTemplates[0] = []
            
                n_4_6_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_4_6_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_4_6_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_6_STATE.outMessages[0] = msg_create(n_4_6_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_4_6_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_4_6_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_4_6_STATE.outMessages[0], 1, 1000)
            
        
                    return n_4_6_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_36_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

        const n_4_3_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_3_STATE.outTemplates[0] = []
            
                n_4_3_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_3_STATE.outMessages[0] = msg_create(n_4_3_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_3_STATE.outMessages[0], 0, 7)
            
        
        
        n_4_3_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_3_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_5_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_5_STATE.outTemplates[0] = []
            
                n_4_5_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_5_STATE.outMessages[0] = msg_create(n_4_5_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_5_STATE.outMessages[0], 0, 15)
            
        
        
        n_4_5_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_5_STATE.outMessages[0]
                }
,
        ]
    

        const n_4_4_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_4_4_STATE.outTemplates[0] = []
            
                n_4_4_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_4_4_STATE.outMessages[0] = msg_create(n_4_4_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_4_4_STATE.outMessages[0], 0, 17)
            
        
        
        n_4_4_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_4_4_STATE.outMessages[0]
                }
,
        ]
    

        const n_5_1_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
            
            
            
            n_5_1_STATE.outTemplates[0] = []
            
                n_5_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            

                n_5_1_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_5_1_STATE.outMessages[0] = msg_create(n_5_1_STATE.outTemplates[0])
            
                msg_writeFloatToken(n_5_1_STATE.outMessages[0], 0, 1)
            

                msg_writeFloatToken(n_5_1_STATE.outMessages[0], 1, 100)
            
        
        
        n_5_1_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
                    return n_5_1_STATE.outMessages[0]
                }
,
        ]
    


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

            const n_3_3_STATE = {
                delayName: '',
                buffer: DELAY_BUFFERS_NULL,
            }

            commons_waitEngineConfigure(() => {
                if ("0-del-L".length) {
                    n_delread_setDelayName(n_3_3_STATE, "0-del-L", () => {
                        n_3_3_STATE.buffer = DELAY_BUFFERS.get(n_3_3_STATE.delayName)
                    })
                }
            })
        

            const n_3_15_STATE = {
                delayName: '',
                buffer: DELAY_BUFFERS_NULL,
            }

            commons_waitEngineConfigure(() => {
                if ("0-del-R".length) {
                    n_delread_setDelayName(n_3_15_STATE, "0-del-R", () => {
                        n_3_15_STATE.buffer = DELAY_BUFFERS.get(n_3_15_STATE.delayName)
                    })
                }
            })
        

            const m_n_0_45_1_sig_STATE = {
                currentValue: 0.25
            }
        



        const n_0_12_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_12_STATE, "delL")
    

            const m_n_0_44_1_sig_STATE = {
                currentValue: 0.25
            }
        



        const n_0_23_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_23_STATE, "delR")
    


            const m_n_0_1_1_sig_STATE = {
                currentValue: 140
            }
        

        const n_0_1_STATE = {
            previous: 0,
            current: 0,
            coeff: 0,
            normal: 0,
        }
    

            const m_n_1_2_1_sig_STATE = {
                currentValue: 5000
            }
        

        const n_1_2_STATE = {
            previous: 0,
            coeff: 0,
        }
    

            const m_n_1_3_1_sig_STATE = {
                currentValue: 5000
            }
        

        const n_1_3_STATE = {
            previous: 0,
            coeff: 0,
        }
    

            const m_n_1_4_1_sig_STATE = {
                currentValue: 5000
            }
        

        const n_1_4_STATE = {
            previous: 0,
            coeff: 0,
        }
    

            const m_n_1_5_1_sig_STATE = {
                currentValue: 5000
            }
        

        const n_1_5_STATE = {
            previous: 0,
            coeff: 0,
        }
    

            const m_n_0_43_1_sig_STATE = {
                currentValue: 0.025
            }
        


            const n_0_35_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_35_STATE.J = 1 / SAMPLE_RATE
            })
        






            const m_n_3_17_1_sig_STATE = {
                currentValue: 1
            }
        


            const m_n_0_14_0_sig_STATE = {
                currentValue: 0.03
            }
        

            const n_0_14_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_14_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_0_15_0_sig_STATE = {
                currentValue: 0.05
            }
        

            const n_0_15_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_15_STATE.J = 1 / SAMPLE_RATE
            })
        



            const m_n_3_22_1_sig_STATE = {
                currentValue: 0.7
            }
        



        const n_3_13_STATE = {
            delayName: '',
            buffer: DELAY_BUFFERS_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_3_13_STATE.buffer = buf_create(
                toInt(Math.ceil(computeUnitInSamples(
                    SAMPLE_RATE, 
                    1000,
                    "msec"
                )))
            )
            if ("0-del-L".length) {
                n_delwrite_setDelayName(n_3_13_STATE, "0-del-L")
            }
        })
    

            const m_n_0_11_0_sig_STATE = {
                currentValue: 0.05
            }
        

            const n_0_11_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_11_STATE.J = 2 * Math.PI / SAMPLE_RATE
            })
        

            const m_n_0_10_0_sig_STATE = {
                currentValue: 0.03
            }
        

            const n_0_10_STATE = {
                phase: 0,
                J: 0,
            }
            
            commons_waitEngineConfigure(() => {
                n_0_10_STATE.J = 1 / SAMPLE_RATE
            })
        



            const m_n_3_23_1_sig_STATE = {
                currentValue: 0.7
            }
        



        const n_3_14_STATE = {
            delayName: '',
            buffer: DELAY_BUFFERS_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_3_14_STATE.buffer = buf_create(
                toInt(Math.ceil(computeUnitInSamples(
                    SAMPLE_RATE, 
                    1000,
                    "msec"
                )))
            )
            if ("0-del-R".length) {
                n_delwrite_setDelayName(n_3_14_STATE, "0-del-R")
            }
        })
    

        const n_0_3_STATE = {
            busName: '',
        }

        n_throw_catch_send_receive_t_setBusName(n_0_3_STATE, "masterOsc")
    

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_27":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1430,751]}},"n_0_29":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1496,751]}},"n_0_47":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[1571,520]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_27":{"0":"ioRcv_n_0_27_0"},"n_0_29":{"0":"ioRcv_n_0_29_0"},"n_0_47":{"0":"ioRcv_n_0_47_0"}},"messageSenders":{}}}}},
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
            n_3_3_OUTS_0 = buf_readSample(n_3_3_STATE.buffer, toInt(Math.round(
            Math.min(
                Math.max(computeUnitInSamples(SAMPLE_RATE, m_n_3_3_0_sig_STATE.currentValue, "msec"), 0), 
                toFloat(n_3_3_STATE.buffer.length - 1)
            )
        )))
n_3_15_OUTS_0 = buf_readSample(n_3_15_STATE.buffer, toInt(Math.round(
            Math.min(
                Math.max(computeUnitInSamples(SAMPLE_RATE, m_n_3_15_0_sig_STATE.currentValue, "msec"), 0), 
                toFloat(n_3_15_STATE.buffer.length - 1)
            )
        )))

        addAssignSignalBus(n_0_12_STATE.busName, (n_3_3_OUTS_0 + (n_3_15_OUTS_0 * m_n_0_45_1_sig_STATE.currentValue)))
    

        addAssignSignalBus(n_0_23_STATE.busName, (n_3_15_OUTS_0 + (n_3_3_OUTS_0 * m_n_0_44_1_sig_STATE.currentValue)))
    

    n_0_1_STATE.coeff = Math.min(Math.max(1 - m_n_0_1_1_sig_STATE.currentValue * (2 * Math.PI) / SAMPLE_RATE, 0), 1)
    n_0_1_STATE.normal = 0.5 * (1 + n_0_1_STATE.coeff)
    n_0_1_STATE.current = (Math.random() * 2 - 1) + n_0_1_STATE.coeff * n_0_1_STATE.previous
    n_0_1_OUTS_0 = n_0_1_STATE.normal * (n_0_1_STATE.current - n_0_1_STATE.previous)
    n_0_1_STATE.previous = n_0_1_STATE.current


    n_lop_t_setFreq(n_1_2_STATE, m_n_1_2_1_sig_STATE.currentValue)
    n_1_2_STATE.previous = n_1_2_OUTS_0 = n_1_2_STATE.coeff * n_0_1_OUTS_0 + (1 - n_1_2_STATE.coeff) * n_1_2_STATE.previous


    n_lop_t_setFreq(n_1_3_STATE, m_n_1_3_1_sig_STATE.currentValue)
    n_1_3_STATE.previous = n_1_3_OUTS_0 = n_1_3_STATE.coeff * n_1_2_OUTS_0 + (1 - n_1_3_STATE.coeff) * n_1_3_STATE.previous


    n_lop_t_setFreq(n_1_4_STATE, m_n_1_4_1_sig_STATE.currentValue)
    n_1_4_STATE.previous = n_1_4_OUTS_0 = n_1_4_STATE.coeff * n_1_3_OUTS_0 + (1 - n_1_4_STATE.coeff) * n_1_4_STATE.previous


    n_lop_t_setFreq(n_1_5_STATE, m_n_1_5_1_sig_STATE.currentValue)
    n_1_5_STATE.previous = n_1_5_OUTS_0 = n_1_5_STATE.coeff * n_1_4_OUTS_0 + (1 - n_1_5_STATE.coeff) * n_1_5_STATE.previous

n_0_43_OUTS_0 = n_1_5_OUTS_0 * m_n_0_43_1_sig_STATE.currentValue

    n_0_28_OUTS_0 = n_0_28_STATE.currentValue
    if (toFloat(FRAME) < n_0_28_STATE.currentLine.p1.x) {
        n_0_28_STATE.currentValue += n_0_28_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_0_28_STATE.currentLine.p1.x) {
            n_0_28_STATE.currentValue = n_0_28_STATE.currentLine.p1.y
        }
    }


    n_0_36_OUTS_0 = n_0_36_STATE.currentValue
    if (toFloat(FRAME) < n_0_36_STATE.currentLine.p1.x) {
        n_0_36_STATE.currentValue += n_0_36_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_0_36_STATE.currentLine.p1.x) {
            n_0_36_STATE.currentValue = n_0_36_STATE.currentLine.p1.y
        }
    }


        n_0_35_OUTS_0 = n_0_35_STATE.phase % 1
        n_0_35_STATE.phase += (n_0_35_STATE.J * n_0_36_OUTS_0)
    

    n_5_0_OUTS_0 = n_5_0_STATE.currentValue
    if (toFloat(FRAME) < n_5_0_STATE.currentLine.p1.x) {
        n_5_0_STATE.currentValue += n_5_0_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_5_0_STATE.currentLine.p1.x) {
            n_5_0_STATE.currentValue = n_5_0_STATE.currentLine.p1.y
        }
    }


    n_6_0_OUTS_0 = n_6_0_STATE.currentValue
    if (toFloat(FRAME) < n_6_0_STATE.currentLine.p1.x) {
        n_6_0_STATE.currentValue += n_6_0_STATE.currentLine.dy
        if (toFloat(FRAME + 1) >= n_6_0_STATE.currentLine.p1.x) {
            n_6_0_STATE.currentValue = n_6_0_STATE.currentLine.p1.y
        }
    }

n_3_17_OUTS_0 = (((n_0_43_OUTS_0 * (n_0_28_OUTS_0 * n_0_35_OUTS_0)) * n_5_0_OUTS_0) + (n_0_43_OUTS_0 * n_6_0_OUTS_0)) * m_n_3_17_1_sig_STATE.currentValue

        n_0_14_OUTS_0 = Math.cos(n_0_14_STATE.phase)
        n_0_14_STATE.phase += (n_0_14_STATE.J * m_n_0_14_0_sig_STATE.currentValue)
    

        n_0_15_OUTS_0 = n_0_15_STATE.phase % 1
        n_0_15_STATE.phase += (n_0_15_STATE.J * m_n_0_15_0_sig_STATE.currentValue)
    
buf_writeSample(n_3_13_STATE.buffer, ((n_3_17_OUTS_0 * (n_0_14_OUTS_0 * n_0_15_OUTS_0)) + (n_3_3_OUTS_0 * m_n_3_22_1_sig_STATE.currentValue)))

        n_0_11_OUTS_0 = Math.cos(n_0_11_STATE.phase)
        n_0_11_STATE.phase += (n_0_11_STATE.J * m_n_0_11_0_sig_STATE.currentValue)
    

        n_0_10_OUTS_0 = n_0_10_STATE.phase % 1
        n_0_10_STATE.phase += (n_0_10_STATE.J * m_n_0_10_0_sig_STATE.currentValue)
    
buf_writeSample(n_3_14_STATE.buffer, ((n_3_17_OUTS_0 * (n_0_11_OUTS_0 * n_0_10_OUTS_0)) + (n_3_15_OUTS_0 * m_n_3_23_1_sig_STATE.currentValue)))
n_7_17_OUTS_0 = +(readSignalBus(n_0_3_STATE.busName) >= n_7_17_STATE.floatInputs.get(1))

    n_7_1_STATE.currentValue = n_7_17_OUTS_0

            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_27: {
                            "0": ioRcv_n_0_27_0,
                        },
n_0_29: {
                            "0": ioRcv_n_0_29_0,
                        },
n_0_47: {
                            "0": ioRcv_n_0_47_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        
exports.commons_getArray = commons_getArray
exports.commons_setArray = commons_setArray
    