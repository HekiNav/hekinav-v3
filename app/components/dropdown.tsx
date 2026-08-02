// Dropdown.js 

'use client'
import React, { ReactNode, useState } from 'react';
import Icon from './icon';
import { ArrowDropDown, ArrowDropUp } from '@material-symbols-svg/react';

export interface DropdownProps<T extends string | number> extends React.HTMLAttributes<HTMLDivElement> {
    items: DropdownItem<T>[],
    initial: ReactNode,
    small?: boolean,
    top?: boolean,
    onSet?: (item: DropdownItem<T>) => void
}
export interface DropdownItem<T extends string | number> {
    id: T | null,
    content: ReactNode
}

export default function Dropdown<T extends string | number>(props: DropdownProps<T>) {
    const {small = false, top = false, items, initial, onSet, ...otherProps} = props

    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<DropdownItem<T>>({ id: null, content: initial });

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (item: DropdownItem<T>) => {
        setSelectedLanguage(item);
        setIsOpen(false);
        if (onSet) onSet(item)
    };


    return (
        <div className="relative inline-block text-left" {...otherProps}>
            <button
                type="button"
                className={`inline-flex justify-center w-full
                               rounded-xl border-3 border-green-600 
                                ${small ? "px-2 py-1" : "px-4 py-2"} bg-white text-sm
                               font-medium text-black hover:bg-green-600`}
                onClick={toggleDropdown}
            >
                {selectedLanguage.content}
                <Icon className="ml-1">{top ? <ArrowDropDown/> : <ArrowDropUp/>}</Icon>
            </button>

            {isOpen && (
                <div className={`${top ? "origin-bottom-right bottom-[100%] mb-2" : "origin-top-right mt-2"} absolute z-1000
                                    left-0 ${small ? "w-min max-h-40 overflow-scroll" : "w-56"} rounded-xl
                                     bg-white ring-3 ring-green-600
                                    ring-opacity-5 focus:outline-none`}>
                    <div>
                        {items.map(({ content, id }, index) => (
                            <a
                                key={index}
                                href="#"
                                className={`block ${small ? "px-2 py-1" : "px-4 py-2"}
                                               text-sm text-black
                                               hover:bg-green-600`}
                                onClick={() => handleSelect({ content, id })}
                            >
                                {content}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}