'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    RotateCcw,
    Contrast,
    Volume2,
    MousePointer2,
    Palette,
    Eye,
    BookOpen,
    Type,
    ArrowUpDown,
    ArrowLeftRight,
    Minus,
    Plus,
    Highlighter,
    CaseSensitive,
    PersonStanding,
    Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ColorBlindnessType =
    | 'none'
    | 'protanopia'
    | 'protanomaly'
    | 'deuteranopia'
    | 'deuteranomaly'
    | 'tritanopia'
    | 'tritanomaly'
    | 'achromatopsia'

interface AccessibilitySettings {
    grayscale: boolean
    screenReader: boolean
    cursorSize: 'normal' | 'large' | 'extra-large'
    contrast: 'normal' | 'high'
    readingMask: boolean
    readingGuide: boolean
    dyslexiaFont: boolean
    verticalSpacing: 'normal' | 'medium' | 'large'
    horizontalSpacing: 'normal' | 'medium' | 'large'
    fontSize: number
    highlightLinks: boolean
    colorBlindness: ColorBlindnessType
}

const defaultSettings: AccessibilitySettings = {
    grayscale: false,
    screenReader: false,
    cursorSize: 'normal',
    contrast: 'normal',
    readingMask: false,
    readingGuide: false,
    dyslexiaFont: false,
    verticalSpacing: 'normal',
    horizontalSpacing: 'normal',
    fontSize: 16,
    highlightLinks: false,
    colorBlindness: 'none',
}

// Referencias a filtros SVG para diferentes tipos de daltonismo
const colorBlindnessFilters: Record<ColorBlindnessType, string> = {
    none: '',
    protanopia: 'url(#protanopia)',
    protanomaly: 'url(#protanomaly)',
    deuteranopia: 'url(#deuteranopia)',
    deuteranomaly: 'url(#deuteranomaly)',
    tritanopia: 'url(#tritanopia)',
    tritanomaly: 'url(#tritanomaly)',
    achromatopsia: 'grayscale(100%)',
}

export function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)

    useEffect(() => {
        const saved = localStorage.getItem('accessibility-settings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setSettings({ ...defaultSettings, ...parsed })
            } catch (e) { }
        }
    }, [])

    useEffect(() => {
        if (!settings.screenReader) {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel()
            }
            return
        }

        if (!window.speechSynthesis) {
            return
        }

        let isSpeaking = false
        let currentUtterance: SpeechSynthesisUtterance | null = null

        let voicesLoaded = false
        let availableVoices: SpeechSynthesisVoice[] = []

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices()
            availableVoices = voices
            voicesLoaded = voices.length > 0
        }

        loadVoices()
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }

        let userHasInteracted = false
        const markUserInteraction = () => {
            if (!userHasInteracted) {
                userHasInteracted = true
                try {
                    const testUtterance = new SpeechSynthesisUtterance('')
                    testUtterance.volume = 0
                    window.speechSynthesis.speak(testUtterance)
                    window.speechSynthesis.cancel()
                } catch (e) { }
            }
        }

        const speak = (text: string, forceUserInteraction = false) => {
            if (!settings.screenReader || !text || text.trim().length === 0) return

            if (forceUserInteraction) {
                markUserInteraction()
            }

            try {
                if (isSpeaking && window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel()
                    setTimeout(() => {
                        startSpeaking(text)
                    }, 150)
                } else {
                    startSpeaking(text)
                }
            } catch (error) { }
        }

        const startSpeaking = (text: string) => {
            try {
                if (!userHasInteracted) {
                    markUserInteraction()
                    setTimeout(() => {
                        startSpeaking(text)
                    }, 100)
                    return
                }

                const utterance = new SpeechSynthesisUtterance(text)
                utterance.lang = 'es-ES'
                utterance.rate = 1.0
                utterance.pitch = 1.0
                utterance.volume = 1.0
                if (voicesLoaded && availableVoices.length > 0) {
                    const spanishVoice = availableVoices.find(voice =>
                        voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
                    )
                    if (spanishVoice) {
                        utterance.voice = spanishVoice
                    } else {
                        utterance.voice = availableVoices[0]
                    }
                }
                utterance.onstart = () => {
                    isSpeaking = true
                    currentUtterance = utterance
                }

                utterance.onend = () => {
                    isSpeaking = false
                    currentUtterance = null
                }

                utterance.onerror = (event) => {
                    isSpeaking = false
                    currentUtterance = null

                    if (event.error === 'canceled') {
                        return
                    } else if (event.error === 'not-allowed') {
                        userHasInteracted = false
                        markUserInteraction()
                        setTimeout(() => {
                            if (userHasInteracted) {
                                startSpeaking(text)
                            }
                        }, 200)
                    }
                }

                currentUtterance = utterance
                window.speechSynthesis.speak(utterance)
            } catch (error) {
                isSpeaking = false
                currentUtterance = null
            }
        }

        const getHTMLElement = (node: EventTarget | null): HTMLElement | null => {
            if (!node) return null

            if (node instanceof HTMLElement) {
                return node
            }
            if (node instanceof Node) {
                let current: Node | null = node
                while (current && current.nodeType !== Node.ELEMENT_NODE) {
                    current = current.parentNode
                }
                return current instanceof HTMLElement ? current : null
            }

            return null
        }

        const getTextFromElement = (element: HTMLElement): string => {
            if (!element) return ''

            const ariaLabel = element.getAttribute?.('aria-label')
            if (ariaLabel && ariaLabel.trim().length > 0) {
                return ariaLabel.trim()
            }
            const title = element.getAttribute?.('title')
            if (title && title.trim().length > 0) {
                return title.trim()
            }

            const alt = element.getAttribute?.('alt')
            if (alt && alt.trim().length > 0) {
                return alt.trim()
            }
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                const placeholder = element.placeholder
                const value = element.value
                if (placeholder && placeholder.trim().length > 0) {
                    return placeholder.trim()
                }
                if (value && value.trim().length > 0) {
                    return value.trim()
                }
            }

            const textContent = element.textContent
            if (textContent) {
                const text = textContent.trim()
                if (text.length > 0 && text.length < 300) {
                    const childCount = element.children?.length || 0
                    if (childCount === 0 || (childCount < 3 && text.length < 100)) {
                        return text
                    }
                }
            }

            return ''
        }

        const handleClick = (e: MouseEvent) => {
            if (!settings.screenReader) return

            markUserInteraction()

            const target = getHTMLElement(e.target)
            if (!target) return

            const textToRead = getTextFromElement(target)

            if (textToRead && textToRead.length > 1 && textToRead.length < 500) {
                speak(textToRead, true)
            }
        }

        const handleFocus = (e: FocusEvent) => {
            if (!settings.screenReader) return

            markUserInteraction()

            const target = getHTMLElement(e.target)
            if (!target) return

            const textToRead = getTextFromElement(target)

            if (textToRead && textToRead.length > 1 && textToRead.length < 500) {
                speak(textToRead, true)
            }
        }
        const handleMouseEnter = (e: MouseEvent) => {
            if (!settings.screenReader) return

            const target = getHTMLElement(e.target)
            if (!target) return
            const isInteractive = target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'SELECT' ||
                target.getAttribute?.('role') === 'button' ||
                target.hasAttribute?.('tabindex') ||
                target.hasAttribute?.('aria-label') ||
                target.hasAttribute?.('title')

            if (isInteractive) {
                const textToRead = getTextFromElement(target)
                if (textToRead && textToRead.length > 1 && textToRead.length < 300) {
                    speak(textToRead)
                }
            }
        }

        document.addEventListener('click', handleClick, true)
        document.addEventListener('focus', handleFocus, true)
        document.addEventListener('mouseenter', handleMouseEnter, true)

        return () => {
            window.speechSynthesis.cancel()
            document.removeEventListener('click', handleClick, true)
            document.removeEventListener('focus', handleFocus, true)
            document.removeEventListener('mouseenter', handleMouseEnter, true)
        }
    }, [settings.screenReader])

    useEffect(() => {
        const root = document.documentElement
        const body = document.body

        // Crear o actualizar los filtros SVG para daltonismo
        let svgFiltersContainer = document.getElementById('colorblindness-filters')
        if (!svgFiltersContainer) {
            svgFiltersContainer = document.createElement('div')
            svgFiltersContainer.id = 'colorblindness-filters'
            svgFiltersContainer.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden;'
            svgFiltersContainer.innerHTML = `
                <svg>
                    <defs>
                        <filter id="protanopia" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/>
                        </filter>
                        <filter id="protanomaly" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix" values="0.817 0.183 0 0 0 0.333 0.667 0 0 0 0 0.125 0.875 0 0 0 0 0 1 0"/>
                        </filter>
                        <filter id="deuteranopia" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/>
                        </filter>
                        <filter id="deuteranomaly" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix" values="0.8 0.2 0 0 0 0.258 0.742 0 0 0 0 0.142 0.858 0 0 0 0 0 1 0"/>
                        </filter>
                        <filter id="tritanopia" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/>
                        </filter>
                        <filter id="tritanomaly" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix" values="0.967 0.033 0 0 0 0 0.733 0.267 0 0 0 0.183 0.817 0 0 0 0 0 1 0"/>
                        </filter>
                    </defs>
                </svg>
            `
            document.body.appendChild(svgFiltersContainer)
        }

        // Aplicar filtros de daltonismo o escala de grises
        let filterValue = ''
        if (settings.grayscale) {
            filterValue = 'grayscale(100%)'
        } else if (settings.colorBlindness !== 'none') {
            if (settings.colorBlindness === 'achromatopsia') {
                filterValue = 'grayscale(100%)'
            } else {
                filterValue = colorBlindnessFilters[settings.colorBlindness]
            }
        }

        root.style.filter = filterValue

        const existingCursorStyle = document.getElementById('cursor-size-style')
        if (existingCursorStyle) existingCursorStyle.remove()

        if (settings.cursorSize !== 'normal') {
            const size = settings.cursorSize === 'large' ? 24 : 32
            const offset = size / 2
            const style = document.createElement('style')
            style.id = 'cursor-size-style'
            style.textContent = `
                * { 
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${offset}" cy="${offset}" r="${offset}" fill="%23000"/></svg>') ${offset} ${offset}, auto !important; 
                }
            `
            document.head.appendChild(style)
        }
        if (settings.contrast === 'high') {
            root.classList.add('high-contrast')
        } else {
            root.classList.remove('high-contrast')
        }

        const existingMask = document.getElementById('reading-mask')
        if (settings.readingMask) {
            if (!existingMask) {
                const maskEl = document.createElement('div')
                maskEl.id = 'reading-mask'
                maskEl.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to bottom, 
                        rgba(0, 0, 0, 0.8) 0%,
                        transparent 20%,
                        transparent 80%,
                        rgba(0, 0, 0, 0.8) 100%);
                    pointer-events: none;
                    z-index: 9998;
                `
                document.body.appendChild(maskEl)
            }
        } else {
            if (existingMask) existingMask.remove()
        }
        const existingGuide = document.getElementById('reading-guide')
        if (settings.readingGuide) {
            if (!existingGuide) {
                const guideEl = document.createElement('div')
                guideEl.id = 'reading-guide'
                guideEl.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: #ff0000;
                    pointer-events: none;
                    z-index: 9999;
                    transition: top 0.05s ease-out;
                    box-shadow: 0 0 4px rgba(255, 0, 0, 0.5);
                `
                document.body.appendChild(guideEl)

                const moveHandler = (e: MouseEvent) => {
                    guideEl.style.top = `${e.clientY - 1}px`
                }

                document.addEventListener('mousemove', moveHandler)
                guideEl.setAttribute('data-handler', 'true')
            }
        } else {
            if (existingGuide) {
                existingGuide.remove()
            }
        }

        if (settings.dyslexiaFont) {
            root.classList.add('dyslexia-font')
            root.style.fontFamily = 'Comic Sans MS, Arial, sans-serif'
        } else {
            root.classList.remove('dyslexia-font')
            root.style.fontFamily = ''
        }
        root.style.setProperty('--vertical-spacing',
            settings.verticalSpacing === 'medium' ? '1.5' :
                settings.verticalSpacing === 'large' ? '2' : '1'
        )
        body.style.lineHeight = `calc(1em * var(--vertical-spacing))`

        root.style.setProperty('--horizontal-spacing',
            settings.horizontalSpacing === 'medium' ? '1.2' :
                settings.horizontalSpacing === 'large' ? '1.5' : '1'
        )
        body.style.letterSpacing = `calc(0.1em * var(--horizontal-spacing))`

        root.style.fontSize = `${settings.fontSize}px`

        if (settings.highlightLinks) {
            root.classList.add('highlight-links')
        } else {
            root.classList.remove('highlight-links')
        }
        localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    }, [settings])

    const resetSettings = () => {
        setSettings(defaultSettings)
    }

    const toggleSetting = (key: keyof AccessibilitySettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const updateSetting = <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        className="fixed bottom-6 right-6 z-50 size-10 bg-black/30 rounded-full shadow-lg hover:shadow-xl transition-all dark:bg-white/30"
                        size="icon"
                        aria-label="Menú de accesibilidad"
                    >
                        <PersonStanding className='size-8' />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto p-3">
                    <SheetHeader>
                        <SheetTitle>Opciones de Accesibilidad</SheetTitle>
                        <SheetDescription>
                            Personaliza la experiencia de navegación según tus necesidades
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <RotateCcw className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Restablecer</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetSettings}
                            >
                                Restablecer
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Contrast className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Cambiar escala de grises</span>
                            </div>
                            <Button
                                variant={settings.grayscale ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    const newGrayscale = !settings.grayscale
                                    setSettings(prev => ({
                                        ...prev,
                                        grayscale: newGrayscale,
                                        // Desactivar filtro de daltonismo si se activa escala de grises
                                        colorBlindness: newGrayscale ? 'none' : prev.colorBlindness
                                    }))
                                }}
                            >
                                {settings.grayscale ? 'Activado' : 'Desactivado'}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Volume2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">Usar un lector de pantalla</span>
                                    <span className="text-xs text-muted-foreground">
                                        Lee el contenido al hacer clic o enfocar elementos
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={settings.screenReader ? "default" : "outline"}
                                    size="sm"
                                    onClick={async () => {
                                        const willBeActive = !settings.screenReader
                                        toggleSetting('screenReader')

                                        if (willBeActive) {
                                            setTimeout(() => {
                                                if (window.speechSynthesis) {
                                                    const voices = window.speechSynthesis.getVoices()
                                                    if (voices.length === 0) {
                                                        setTimeout(() => {
                                                            const voices2 = window.speechSynthesis.getVoices()
                                                            const utterance = new SpeechSynthesisUtterance('Lector de pantalla activado. Haz clic en los elementos para escucharlos.')
                                                            utterance.lang = 'es-ES'
                                                            utterance.volume = 1.0
                                                            utterance.rate = 1.0
                                                            utterance.pitch = 1.0

                                                            const spanishVoice = voices2.find(voice =>
                                                                voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
                                                            )
                                                            if (spanishVoice) {
                                                                utterance.voice = spanishVoice
                                                            } else if (voices2.length > 0) {
                                                                utterance.voice = voices2[0]
                                                            }

                                                            utterance.onerror = () => { }

                                                            window.speechSynthesis.speak(utterance)
                                                        }, 500)
                                                    } else {
                                                        const utterance = new SpeechSynthesisUtterance('Lector de pantalla activado. Haz clic en los elementos para escucharlos.')
                                                        utterance.lang = 'es-ES'
                                                        utterance.volume = 1.0
                                                        utterance.rate = 1.0
                                                        utterance.pitch = 1.0

                                                        const spanishVoice = voices.find(voice =>
                                                            voice.lang.startsWith('es') || voice.name.toLowerCase().includes('spanish')
                                                        )
                                                        if (spanishVoice) {
                                                            utterance.voice = spanishVoice
                                                        } else if (voices.length > 0) {
                                                            utterance.voice = voices[0]
                                                        }

                                                        utterance.onerror = () => { }

                                                        window.speechSynthesis.speak(utterance)
                                                    }
                                                }
                                            }, 300)
                                        } else {
                                            if (window.speechSynthesis) {
                                                window.speechSynthesis.cancel()
                                            }
                                        }
                                    }}
                                >
                                    {settings.screenReader ? 'Activado' : 'Desactivado'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MousePointer2 className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Cambiar tamaño de cursor</span>
                            </div>
                            <div className="flex gap-2">
                                {(['normal', 'large', 'extra-large'] as const).map((size) => (
                                    <Button
                                        key={size}
                                        variant={settings.cursorSize === size ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateSetting('cursorSize', size)}
                                    >
                                        {size === 'normal' ? 'N' : size === 'large' ? 'M' : 'G'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Palette className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Cambiar el contraste de color</span>
                            </div>
                            <Button
                                variant={settings.contrast === 'high' ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSetting('contrast', settings.contrast === 'high' ? 'normal' : 'high')}
                            >
                                {settings.contrast === 'high' ? 'Alto' : 'Normal'}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2 p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Circle className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="font-medium">Filtro de daltonismo</span>
                                    <span className="text-xs text-muted-foreground">
                                        Selecciona un filtro de daltonismo
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {([
                                    { value: 'none', label: 'Ninguno' },
                                    { value: 'protanopia', label: 'Protanopía' },
                                    { value: 'protanomaly', label: 'Protanomalía' },
                                    { value: 'deuteranopia', label: 'Deuteranopía' },
                                    { value: 'deuteranomaly', label: 'Deuteranomalía' },
                                    { value: 'tritanopia', label: 'Tritanopía' },
                                    { value: 'tritanomaly', label: 'Tritanomalía' },
                                    { value: 'achromatopsia', label: 'Acromatopsia' },
                                ] as const).map(({ value, label }) => (
                                    <Button
                                        key={value}
                                        variant={settings.colorBlindness === value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            setSettings(prev => ({
                                                ...prev,
                                                colorBlindness: value,
                                                // Desactivar escala de grises si se selecciona un filtro de daltonismo
                                                grayscale: value !== 'none' ? false : prev.grayscale
                                            }))
                                        }}
                                        className="text-xs"
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Eye className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Mascara de lectura</span>
                            </div>
                            <Button
                                variant={settings.readingMask ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSetting('readingMask')}
                            >
                                {settings.readingMask ? 'Activado' : 'Desactivado'}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Guia de Lectura</span>
                            </div>
                            <Button
                                variant={settings.readingGuide ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSetting('readingGuide')}
                            >
                                {settings.readingGuide ? 'Activado' : 'Desactivado'}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Type className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Cambio de tipografia dislexia</span>
                            </div>
                            <Button
                                variant={settings.dyslexiaFont ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSetting('dyslexiaFont')}
                            >
                                {settings.dyslexiaFont ? 'Activado' : 'Desactivado'}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <ArrowUpDown className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Espaciado vertical</span>
                            </div>
                            <div className="flex gap-2">
                                {(['normal', 'medium', 'large'] as const).map((spacing) => (
                                    <Button
                                        key={spacing}
                                        variant={settings.verticalSpacing === spacing ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateSetting('verticalSpacing', spacing)}
                                    >
                                        {spacing === 'normal' ? 'N' : spacing === 'medium' ? 'M' : 'G'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Espaciado Horizontal</span>
                            </div>
                            <div className="flex gap-2">
                                {(['normal', 'medium', 'large'] as const).map((spacing) => (
                                    <Button
                                        key={spacing}
                                        variant={settings.horizontalSpacing === spacing ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateSetting('horizontalSpacing', spacing)}
                                    >
                                        {spacing === 'normal' ? 'N' : spacing === 'medium' ? 'M' : 'G'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <CaseSensitive className="h-5 w-5 text-primary" />
                                    </div>
                                </div>
                                <span className="font-medium">Cambiar tamaño</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm w-12 text-center">{settings.fontSize}px</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Highlighter className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium">Resaltar Enlaces</span>
                            </div>
                            <Button
                                variant={settings.highlightLinks ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSetting('highlightLinks')}
                            >
                                {settings.highlightLinks ? 'Activado' : 'Desactivado'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

        </>
    )
}

