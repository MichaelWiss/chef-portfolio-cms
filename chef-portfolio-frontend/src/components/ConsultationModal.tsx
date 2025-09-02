'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PrivateDiningEnquiry from './PrivateDiningEnquiry';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="relative">
                  <div className="flex items-center justify-between p-6 border-b border-stone-200">
                    <Dialog.Title className="text-2xl font-serif font-display text-stone-900">
                      Book a Consultation
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="w-6 h-6 text-stone-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-stone-600 leading-relaxed">
                      Ready to create an unforgettable culinary experience? Let's discuss your vision and bring it to life.
                    </p>
                  </div>

                  <PrivateDiningEnquiry onSuccess={onClose} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
