import React from 'react';
import ChessboardComponent from '../../../components/ChessboardComponent';
import YellowLight from '../../../components/ui/YellowLight';

export default function GamePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <YellowLight top='25%' left='65%' />
      <ChessboardComponent />
    </div>
  );
}