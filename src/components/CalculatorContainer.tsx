import { useState } from 'react'
import { Calculator, TrendingUp } from 'lucide-react'
import TasacionForm from './TasacionForm'
import InterestCalculator from './InterestCalculator'

type CalculatorSection = 'costas' | 'intereses'

export default function CalculatorContainer() {
  const [activeSection, setActiveSection] = useState<CalculatorSection>('costas')

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveSection('costas')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'costas'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>TASADOR COSTAS</span>
            </button>
            <button
              onClick={() => setActiveSection('intereses')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'intereses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>CALCULADOR INTERESES</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'costas' && <TasacionForm />}
          {activeSection === 'intereses' && <InterestCalculator />}
        </div>
      </div>
    </div>
  )
}