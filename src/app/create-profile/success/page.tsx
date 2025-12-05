'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer les données de l'utilisateur depuis le localStorage ou une API
    const fetchUserData = async () => {
      try {
        // Ici, vous devriez appeler votre API pour récupérer les données de l'utilisateur
        // const response = await fetch('/api/user/me');
        // const data = await response.json();
        // setUserData(data);
        
        // Simulation de chargement
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        <p className="text-gray-300">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700 mt-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-4">Connexion réussie !</h1>
      
      <p className="text-gray-300 mb-8">
        Votre compte a été connecté avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de FA Helper.
      </p>
      
      <div className="space-y-4">
        <Button asChild className="w-full bg-red-600 hover:bg-red-700">
          <Link href="/dashboard">
            Accéder à mon tableau de bord
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full">
          <Link href="/teams">
            Voir les équipes disponibles
          </Link>
        </Button>
      </div>
    </div>
  );
}
