import React from 'react';
import ChessboardComponent from '../../../components/ChessboardComponent';

export default function GamePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <ChessboardComponent />
    </div>
  );
}