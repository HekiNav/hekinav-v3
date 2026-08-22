import Card, { CardProps } from "./card";

export interface ModalProps extends CardProps {
    open?: boolean
    close?: () => void
}

export default function Modal({open=false, close, ...props}: ModalProps) {
    return (
        <div onMouseDown={(e) => (e.target as HTMLDivElement).id == "close-modal" && close && close()} id="close-modal" hidden={!open} className="flex items-center justify-center absolute w-screen h-screen z-500 bg-white/50 top-0">
            <Card {...props}></Card>
        </div>
    )
}