"use client"

import mqtt, { IClientOptions, MqttClient } from "mqtt";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline" | "closed" | "error"

export interface MqttMessage {
    topic: string,
    payload: Uint8Array,
    message: string
}

export interface Subscription {
    refCount: number,
    qos: 0 | 1 | 2,
    listeners: Set<(msg: MqttMessage) => void>
}

interface MqttContextValue {
    client: MqttClient | null;
    connectionStatus: ConnectionState;
    subscribe: (
        topic: string,
        qos: 0 | 1 | 2,
        listener: (msg: MqttMessage) => void
    ) => () => void;
}

const MqttContext = createContext<MqttContextValue | null>(null)

export interface MqttProviderProps {
    brokerUrl: string,
    options?: IClientOptions,
    children: React.ReactNode
}

export function MqttProvider({ brokerUrl, options, children }: MqttProviderProps) {
    const clientRef = useRef<MqttClient | null>(null)
    const subscriptionsRef = useRef<Map<string, Subscription>>(new Map())
    const [connectionStatus, setConnectionStatus] = useState<ConnectionState>("offline")
    const [, forceRender] = useState(0)

    useEffect(() => {
        const client = mqtt.connect(brokerUrl, options)
        clientRef.current = client
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConnectionStatus("connecting")

        client.on("connect", () => {
            setConnectionStatus("connected")
            subscriptionsRef.current.forEach((entry, topic) => {
                client.subscribe(topic, { qos: entry.qos })
            })
            forceRender((n) => n + 1)
        })

        client.on("reconnect", () => setConnectionStatus("reconnecting"))
        client.on("close", () => setConnectionStatus("closed"))
        client.on("offline", () => setConnectionStatus("offline"))
        client.on("error", (err) => {
            console.error("MQTT error:", err)
            setConnectionStatus("error")
        })

        client.on("message", (topic: string, payload: Buffer) => {
            const raw = new Uint8Array(payload)
            let asString = ""
            try {
                asString = new TextDecoder("utf-8", { fatal: false }).decode(raw)
            } catch {
                asString = ""
            }
            const msg: MqttMessage = { topic, payload: raw, message: asString }

            subscriptionsRef.current.forEach((entry, filter) => {
                if (topicMatches(filter, topic)) {
                    entry.listeners.forEach((listener) => listener(msg))
                }
            })
        })

        return () => {
            client.end(true)
            clientRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brokerUrl])

    const subscribe = useCallback(
        (
            topic: string,
            qos: 0 | 1 | 2,
            listener: (msg: MqttMessage) => void
        ) => {
            const subs = subscriptionsRef.current
            let entry = subs.get(topic)

            if (!entry) {
                entry = { refCount: 0, qos, listeners: new Set() }
                subs.set(topic, entry)
                clientRef.current?.subscribe(topic, { qos })
            }
            entry.refCount += 1
            entry.listeners.add(listener)

            return () => {
                const current = subs.get(topic)
                if (!current) return
                current.listeners.delete(listener)
                current.refCount -= 1
                if (current.refCount <= 0) {
                    subs.delete(topic)
                    clientRef.current?.unsubscribe(topic)
                }
            }
        },
        []
    )

    return (
        // eslint-disable-next-line react-hooks/refs
        <MqttContext value={{ client: clientRef.current, connectionStatus, subscribe }}>
            {children}
        </MqttContext>
    )
}

export function useMqttState() {
    const ctx = useContext(MqttContext)
    if (!ctx) {
        throw new Error("useMqttState must be used within an <MqttProvider>")
    }
    return { mqttClient: ctx.client, connectionStatus: ctx.connectionStatus }
}

export interface UseSubscriptionOptions {
    qos?: 0 | 1 | 2
}

export function useSubscription(
    topic: string | string[] | null | undefined,
    options: UseSubscriptionOptions = {}
) {
    const ctx = useContext(MqttContext)
    if (!ctx) {
        throw new Error("useSubscription must be used within an <MqttProvider>")
    }
    const { qos = 0 } = options
    const [message, setMessage] = useState<MqttMessage | null>(null)

    const topics = topic == null ? [] : Array.isArray(topic) ? topic : [topic];


    useEffect(() => {
        const handleMessage = (msg: MqttMessage) => {
            setMessage(msg);
        }

        const unsubscribers = topics.map((t) => ctx.subscribe(t, qos, handleMessage));

        return () => {
            unsubscribers.forEach((e) => e());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topics, qos])

    return {
        message,
        mqttClient: ctx.client,
        connectionStatus: ctx.connectionStatus,
    }
}


function topicMatches(filter: string, topic: string) {
    const filterParts = filter.split("/")
    const topicParts = topic.split("/")

    for (let i = 0; i < filterParts.length; i++) {
        const f = filterParts[i]
        if (f === "#") return true
        if (i >= topicParts.length) return false
        if (f !== "+" && f !== topicParts[i]) return false
    }
    return filterParts.length === topicParts.length
}
