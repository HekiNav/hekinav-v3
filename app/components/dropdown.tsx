// Dropdown.js 

'use client'
import React, { ReactNode, useState } from 'react';
import Icon from './icon';
import { ArrowDropDownW700 as ArrowDropDown } from '@material-symbols-svg/react/icons/arrow-drop-down';

export interface DropdownProps<T> extends React.HTMLAttributes<HTMLDivElement> {
    items: DropdownItem<T>[],
    initial: ReactNode,
    small?: boolean,
    onSet?: (item: DropdownItem<T>) => void
}
export interface DropdownItem<T> {
    id: T | null,
    content: ReactNode
}

export default function Dropdown<T extends string | number>(props: DropdownProps<T>) {
    const {small = false, items, initial, onSet, ...otherProps} = props

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
                <Icon className="ml-1">{<ArrowDropDown></ArrowDropDown>}</Icon>
            </button>

            {isOpen && (
                <div className={`origin-top-right mt-2 absolute z-1000
                                    left-0 ${small ? "w-min max-h-40 overflow-scroll" : "min-w-56 max-w-full"} rounded-xl
                                     bg-white ring-3 ring-green-600
                                    ring-opacity-5 focus:outline-none`}>
                    <div>
                        {items.map(({ content, id }, index) => (
                            <div
                                key={index}
                                className={`block ${small ? "px-2 py-1" : "px-4 py-2"}
                                               text-sm text-black
                                               hover:bg-green-600`}
                                onClick={() => handleSelect({ content, id })}
                            >
                                {content}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}