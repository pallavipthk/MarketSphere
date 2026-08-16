import React from 'react';
import { Check, ClipboardList, CheckSquare, Truck, PackageCheck } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
}

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const steps = [
    { label: 'PLACED', key: 'PLACED', icon: ClipboardList, desc: 'Order submitted by buyer' },
    { label: 'CONFIRMED', key: 'CONFIRMED', icon: CheckSquare, desc: 'Accepted by merchant' },
    { label: 'SHIPPED', key: 'SHIPPED', icon: Truck, desc: 'Handed to courier' },
    { label: 'DELIVERED', key: 'DELIVERED', icon: PackageCheck, desc: 'Package received' },
  ];

  const statusWeights = {
    PLACED: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

  const currentIndex = statusWeights[currentStatus];

  return (
    <div className="w-full py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center md:flex-col gap-4 md:gap-2 md:text-center md:flex-1 relative">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10 ${
                    isDone
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-white border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-indigo-100 scale-110' : ''}`}
                >
                  {isDone && index < currentIndex ? (
                    <Check className="w-5 h-5 font-bold" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col md:items-center">
                  <div
                    className={`text-xs font-black tracking-wider uppercase ${
                      isDone ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium max-w-[120px]">
                    {step.desc}
                  </span>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] bg-slate-100 relative -translate-y-5">
                  <div
                    className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: index < currentIndex ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
