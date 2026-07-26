import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { useEffect, useRef, useState } from 'react';
import Image1 from '../../../../public/ocd-1.jpg';
import Image2 from '../../../../public/ocd-2.jpg';
import Image3 from '../../../../public/ocd-3.jpg';
import OCD from '../../../../public/ocd_logo.svg';
import music from '../../../../public/audio/pagbabago.mp3';
import ayaw from '../../../../public/audio/ayaw.mp3';
import { Button } from '@/components/ui/button';
import { Music2Icon, Volume2, VolumeOff } from 'lucide-react';

const images = [Image1, Image2, Image3];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setIndex((prev) => (prev + 1) % images.length);
                setFade(true);
            }, 500);
        }, 5000);

        return () => clearInterval(timer);
    }, [images.length]);

    useEffect(() => {
        const song = new Audio(music);
        song.loop = true;
        song.volume = 0.3;

        audioRef.current = song;

        return () => {
            song.pause();
            song.src = '';
        };
    }, []);

    async function handleMusic() {
        if (!audioRef.current) return;

        if (playing) {
            audioRef.current.pause();
        } else {
            await audioRef.current.play();
        }

        setPlaying(!playing);
    }

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col overflow-hidden bg-muted p-10 text-white lg:flex dark:border-r">
                <img
                    src={images[index]}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
                        fade ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                <div className="absolute inset-0 bg-zinc-900/60" />

                <div className="flex items-center justify-between">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center text-lg font-medium"
                    >
                        {/* <AppLogoIcon className="mr-2 size-8 fill-current text-white" /> */}
                        <img
                            src={OCD}
                            className="mr-2 size-20 fill-current text-white"
                            alt="OCD_logo"
                        />
                        <span className="text-2xl font-bold">
                            Office Of Civil Defense
                        </span>
                    </Link>
                    <Button onClick={handleMusic} className="z-20">
                        {playing ? <Volume2 /> : <VolumeOff />}
                    </Button>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <img
                            src={OCD}
                            className="mr-2 size-36 fill-current text-white"
                            alt="OCD_logo"
                        />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
