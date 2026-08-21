"use client"
import { useMqttState } from "mqtt-react-hooks"
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Status() {
  /*
   * Status strings:
   * - Connecting
   * - Connected
   * - Reconnecting
   * - Offline
   * - Error
   */
  const { connectionStatus } = useMqttState();

  useEffect(() => {
    toast(`MQTT Status: ${connectionStatus}`)
  }, [connectionStatus])

  return <></>;
}