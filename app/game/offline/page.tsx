import React from 'react';
import ChessboardComponent from '../../../components/ChessboardComponent';
import YellowLight from '../../../components/ui/YellowLight';

export default function GamePage() {
  return (
    <div className='relative flex flex-col items-center justify-center h-screen w-full md:overflow-hidden overflow-visible'>
      {/* Background light effect with adjusted positioning */}
      <YellowLight top='20%' left='65%' />
      
      {/* Main content container with proper padding */}
      <div className='container mx-auto px-4 py-6 flex flex-col items-center justify-center'>
        <h1 className='text-2xl md:text-3xl font-bold'>Offline Game</h1>
        
        {/* Chess game container with shadow for better visual separation */}
        <div className='w-full flex justify-center items-center'>
          <ChessboardComponent />
        </div>
      </div>
    </div>
  );
}