
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
function commons_waitEngineConfigure(callback) {
            sked_wait(_commons_ENGINE_LOGGED_SKEDULER, 'configure', callback)
        }
function commons_waitFrame(frame, callback) {
            return sked_wait_future(_commons_FRAME_SKEDULER, frame.toString(), callback)
        }
function commons_cancelWaitFrame(id) {
            sked_cancel(_commons_FRAME_SKEDULER, id)
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

function n_delwrite_setDelayName(state, delayName) {
                if (state.delayName.length) {
                    DELAY_BUFFERS_delete(state.delayName)
                }
                state.delayName = delayName
                if (state.delayName.length) {
                    DELAY_BUFFERS_set(state.delayName, state.buffer)
                }
            }
        
function n_0_12_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            n_line_stopCurrentLine(n_0_12_STATE)
            switch (msg_getLength(m)) {
                case 3:
                    n_line_setGrain(n_0_12_STATE, msg_readFloatToken(m, 2))
                case 2:
                    n_line_setNextDuration(n_0_12_STATE, msg_readFloatToken(m, 1))
                case 1:
                    const targetValue = msg_readFloatToken(m, 0)
                    if (n_0_12_STATE.nextDurationSamp === 0) {
                        n_0_12_STATE.currentValue = targetValue
                        m_n_0_5_0__routemsg_RCVS_0(msg_floats([targetValue]))
                    } else {
                        m_n_0_5_0__routemsg_RCVS_0(msg_floats([n_0_12_STATE.currentValue]))
                        n_line_setNewLine(n_0_12_STATE, targetValue)
                        n_line_incrementTime(n_0_12_STATE, n_0_12_STATE.currentLine.dx)
                        n_line_scheduleNextTick(n_0_12_STATE)
                    }
                    
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_stopCurrentLine(n_0_12_STATE)
            return

        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_line_stopCurrentLine(n_0_12_STATE)
            n_0_12_STATE.currentValue = msg_readFloatToken(m, 1)
            return
        }
    
                                throw new Error('[line], id "n_0_12", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_5_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_0_5_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_5_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_5_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_0_5_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_0_5_0_sig", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_14_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            n_line_stopCurrentLine(n_0_14_STATE)
            switch (msg_getLength(m)) {
                case 3:
                    n_line_setGrain(n_0_14_STATE, msg_readFloatToken(m, 2))
                case 2:
                    n_line_setNextDuration(n_0_14_STATE, msg_readFloatToken(m, 1))
                case 1:
                    const targetValue = msg_readFloatToken(m, 0)
                    if (n_0_14_STATE.nextDurationSamp === 0) {
                        n_0_14_STATE.currentValue = targetValue
                        m_n_0_17_0__routemsg_RCVS_0(msg_floats([targetValue]))
                    } else {
                        m_n_0_17_0__routemsg_RCVS_0(msg_floats([n_0_14_STATE.currentValue]))
                        n_line_setNewLine(n_0_14_STATE, targetValue)
                        n_line_incrementTime(n_0_14_STATE, n_0_14_STATE.currentLine.dx)
                        n_line_scheduleNextTick(n_0_14_STATE)
                    }
                    
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_stopCurrentLine(n_0_14_STATE)
            return

        } else if (
            msg_isMatching(m, [MSG_STRING_TOKEN, MSG_FLOAT_TOKEN])
            && msg_readStringToken(m, 0) === 'set'
        ) {
            n_line_stopCurrentLine(n_0_14_STATE)
            n_0_14_STATE.currentValue = msg_readFloatToken(m, 1)
            return
        }
    
                                throw new Error('[line], id "n_0_14", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_17_0__routemsg_RCVS_0(m) {
                                
            if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
                m_n_0_17_0_sig_RCVS_0(m)
                return
            } else {
                SND_TO_NULL(m)
                return
            }
        
                                throw new Error('[_routemsg], id "m_n_0_17_0__routemsg", inlet "0", unsupported message : ' + msg_display(m))
                            }

function m_n_0_17_0_sig_RCVS_0(m) {
                                
        if (msg_isMatching(m, [MSG_FLOAT_TOKEN])) {
            m_n_0_17_0_sig_STATE.currentValue = msg_readFloatToken(m, 0)
            return
        }
    
                                throw new Error('[sig~], id "m_n_0_17_0_sig", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_12_RCVS_0(n_0_11_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_11", inlet "0", unsupported message : ' + msg_display(m))
                            }

function n_0_13_RCVS_0(m) {
                                
            if (
                msg_isStringToken(m, 0) 
                && msg_readStringToken(m, 0) === 'set'
            ) {
                n_0_13_STATE.outTemplates = [[]]
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        n_0_13_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
                    } else {
                        n_0_13_STATE.outTemplates[0].push(MSG_STRING_TOKEN)
                        n_0_13_STATE.outTemplates[0].push(msg_readStringToken(m, i).length)
                    }
                }

                const message = msg_create(n_0_13_STATE.outTemplates[0])
                for (let i = 1; i < msg_getLength(m); i++) {
                    if (msg_isFloatToken(m, i)) {
                        msg_writeFloatToken(
                            message, i - 1, msg_readFloatToken(m, i)
                        )
                    } else {
                        msg_writeStringToken(
                            message, i - 1, msg_readStringToken(m, i)
                        )
                    }
                }
                n_0_13_STATE.outMessages[0] = message
                n_0_13_STATE.messageTransferFunctions.splice(0, n_0_13_STATE.messageTransferFunctions.length - 1)
                n_0_13_STATE.messageTransferFunctions[0] = function (m) {
                    return n_0_13_STATE.outMessages[0]
                }
                return

            } else {
                for (let i = 0; i < n_0_13_STATE.messageTransferFunctions.length; i++) {
                    n_0_14_RCVS_0(n_0_13_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_13", inlet "0", unsupported message : ' + msg_display(m))
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
                    n_0_24_RCVS_0(n_0_23_STATE.messageTransferFunctions[i](m))
                }
                return
            }
        
                                throw new Error('[msg], id "n_0_23", inlet "0", unsupported message : ' + msg_display(m))
                            }
let n_0_24_OUTS_0 = 0
function n_0_24_RCVS_0(m) {
                                
        if (
            msg_isMatching(m, [MSG_FLOAT_TOKEN])
            || msg_isMatching(m, [MSG_FLOAT_TOKEN, MSG_FLOAT_TOKEN])
        ) {
            switch (msg_getLength(m)) {
                case 2:
                    n_line_t_setNextDuration(n_0_24_STATE, msg_readFloatToken(m, 1))
                case 1:
                    n_line_t_setNewLine(n_0_24_STATE, msg_readFloatToken(m, 0))
            }
            return

        } else if (msg_isAction(m, 'stop')) {
            n_line_t_stop(n_0_24_STATE)
            return

        }
    
                                throw new Error('[line~], id "n_0_24", inlet "0", unsupported message : ' + msg_display(m))
                            }










let n_0_19_OUTS_0 = 0







































        

        function ioRcv_n_0_11_0(m) {n_0_11_RCVS_0(m)}
function ioRcv_n_0_13_0(m) {n_0_13_RCVS_0(m)}
function ioRcv_n_0_23_0(m) {n_0_23_RCVS_0(m)}
        

        
        const n_0_12_STATE = {
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
            snd0: m_n_0_5_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_line_setGrain(n_0_12_STATE, 20)
            n_0_12_STATE.tickCallback = function () {
                n_line_tick(n_0_12_STATE)
            }
        })
    


            const m_n_0_5_0_sig_STATE = {
                currentValue: 250
            }
        

        const n_0_14_STATE = {
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
            snd0: m_n_0_17_0__routemsg_RCVS_0,
            tickCallback: function () {},
        }

        commons_waitEngineConfigure(() => {
            n_line_setGrain(n_0_14_STATE, 20)
            n_0_14_STATE.tickCallback = function () {
                n_line_tick(n_0_14_STATE)
            }
        })
    


            const m_n_0_17_0_sig_STATE = {
                currentValue: 250
            }
        

        const n_0_11_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_0_11_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_0_11_STATE.outTemplates[0] = []
            
                n_0_11_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_11_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_0_11_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_11_STATE.outMessages[0] = msg_create(n_0_11_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_11_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_11_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_0_11_STATE.outMessages[0], 1, 100)
            
        
                    return n_0_11_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_13_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_0_13_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_0_13_STATE.outTemplates[0] = []
            
                n_0_13_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_13_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_0_13_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_13_STATE.outMessages[0] = msg_create(n_0_13_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_13_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_13_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_0_13_STATE.outMessages[0], 1, 100)
            
        
                    return n_0_13_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_23_STATE = {
            outTemplates: [],
            outMessages: [],
            messageTransferFunctions: [],
        }

        
        
        n_0_23_STATE.messageTransferFunctions = [
            function (inMessage) {
                    
            
            
            let stringMem = []
            n_0_23_STATE.outTemplates[0] = []
            
                n_0_23_STATE.outTemplates[0].push(msg_getTokenType(inMessage, 0))
                if (msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = msg_readStringToken(inMessage, 0)
                    n_0_23_STATE.outTemplates[0].push(stringMem[0].length)
                }
            

                n_0_23_STATE.outTemplates[0].push(MSG_FLOAT_TOKEN)
            
            n_0_23_STATE.outMessages[0] = msg_create(n_0_23_STATE.outTemplates[0])
            
                if (msg_isFloatToken(inMessage, 0)) {
                    msg_writeFloatToken(n_0_23_STATE.outMessages[0], 0, msg_readFloatToken(inMessage, 0))
                } else if (msg_isStringToken(inMessage, 0)) {
                    msg_writeStringToken(n_0_23_STATE.outMessages[0], 0, stringMem[0])
                }
            

                msg_writeFloatToken(n_0_23_STATE.outMessages[0], 1, 10)
            
        
                    return n_0_23_STATE.outMessages[0]
                }
,
        ]
    

        const n_0_24_STATE = {
            currentLine: n_line_t_defaultLine,
            currentValue: 0,
            nextDurationSamp: 0,
        }
    

            const n_0_5_STATE = {
                delayName: '',
                buffer: DELAY_BUFFERS_NULL,
            }

            commons_waitEngineConfigure(() => {
                if ("0-del-L".length) {
                    n_delread_setDelayName(n_0_5_STATE, "0-del-L", () => {
                        n_0_5_STATE.buffer = DELAY_BUFFERS.get(n_0_5_STATE.delayName)
                    })
                }
            })
        

            const m_n_0_2_1_sig_STATE = {
                currentValue: 0.6
            }
        


            const m_n_0_19_0_sig_STATE = {
                currentValue: 0
            }
        

            const m_n_0_19_1_sig_STATE = {
                currentValue: 1
            }
        



        const n_0_15_STATE = {
            delayName: '',
            buffer: DELAY_BUFFERS_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_15_STATE.buffer = buf_create(
                toInt(Math.ceil(computeUnitInSamples(
                    SAMPLE_RATE, 
                    1000,
                    "msec"
                )))
            )
            if ("0-del-L".length) {
                n_delwrite_setDelayName(n_0_15_STATE, "0-del-L")
            }
        })
    

            const n_0_17_STATE = {
                delayName: '',
                buffer: DELAY_BUFFERS_NULL,
            }

            commons_waitEngineConfigure(() => {
                if ("0-del-R".length) {
                    n_delread_setDelayName(n_0_17_STATE, "0-del-R", () => {
                        n_0_17_STATE.buffer = DELAY_BUFFERS.get(n_0_17_STATE.delayName)
                    })
                }
            })
        

            const m_n_0_1_1_sig_STATE = {
                currentValue: 0.6
            }
        



        const n_0_16_STATE = {
            delayName: '',
            buffer: DELAY_BUFFERS_NULL,
        }

        commons_waitEngineConfigure(() => {
            n_0_16_STATE.buffer = buf_create(
                toInt(Math.ceil(computeUnitInSamples(
                    SAMPLE_RATE, 
                    1000,
                    "msec"
                )))
            )
            if ("0-del-R".length) {
                n_delwrite_setDelayName(n_0_16_STATE, "0-del-R")
            }
        })
    

        const exports = {
            metadata: {"libVersion":"0.1.0","audioSettings":{"bitDepth":64,"channelCount":{"in":2,"out":2},"sampleRate":0,"blockSize":0},"compilation":{"io":{"messageReceivers":{"n_0_11":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[66,166]}},"n_0_13":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[254,166]}},"n_0_23":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[451,293]}}},"messageSenders":{}},"variableNamesIndex":{"io":{"messageReceivers":{"n_0_11":{"0":"ioRcv_n_0_11_0"},"n_0_13":{"0":"ioRcv_n_0_13_0"},"n_0_23":{"0":"ioRcv_n_0_23_0"}},"messageSenders":{}}}}},
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
            n_0_19_OUTS_0 = m_n_0_19_0_sig_STATE.currentValue * m_n_0_19_1_sig_STATE.currentValue
buf_writeSample(n_0_15_STATE.buffer, (((buf_readSample(n_0_5_STATE.buffer, toInt(Math.round(
            Math.min(
                Math.max(computeUnitInSamples(SAMPLE_RATE, m_n_0_5_0_sig_STATE.currentValue, "msec"), 0), 
                toFloat(n_0_5_STATE.buffer.length - 1)
            )
        )))) * m_n_0_2_1_sig_STATE.currentValue) + n_0_19_OUTS_0))
buf_writeSample(n_0_16_STATE.buffer, (((buf_readSample(n_0_17_STATE.buffer, toInt(Math.round(
            Math.min(
                Math.max(computeUnitInSamples(SAMPLE_RATE, m_n_0_17_0_sig_STATE.currentValue, "msec"), 0), 
                toFloat(n_0_17_STATE.buffer.length - 1)
            )
        )))) * m_n_0_1_1_sig_STATE.currentValue) + n_0_19_OUTS_0))
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_11: {
                            "0": ioRcv_n_0_11_0,
                        },
n_0_13: {
                            "0": ioRcv_n_0_13_0,
                        },
n_0_23: {
                            "0": ioRcv_n_0_23_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        

    