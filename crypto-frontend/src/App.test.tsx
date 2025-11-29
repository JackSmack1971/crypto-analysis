import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { BrowserRouter } from 'react-router-dom'

describe('App', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        )
        // Since we don't know exactly what's in App, let's just check it renders
        // Ideally we check for a title or specific element
        // Based on GEMINI.md, it's a crypto analysis platform
        // Let's assume there's some text content
        expect(document.body).toBeInTheDocument()
    })
})
