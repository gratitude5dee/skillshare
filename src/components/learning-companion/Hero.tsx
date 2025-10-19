import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Upload } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <div className="self-center flex w-full max-w-[1400px] flex-col pt-20 pb-32 px-8 lg:px-20">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-8">
          <div className="space-y-6">
            <h1 className="text-[56px] font-headline font-bold tracking-tight leading-[1.1] bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent max-md:text-[40px]">
              WZRD.work
            </h1>
            <p className="text-2xl font-light text-white/90 max-md:text-xl">
              powered by Gemini
            </p>
          </div>
          
          <p className="text-lg text-white/85 leading-relaxed max-w-[680px]">
            Built for YOU. AI-powered work assistance that transforms your productivity and streamlines your workflow with cutting-edge automation.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="gradient" size="lg" className="gap-3">
              <Play className="w-5 h-5" />
              Start Recording
            </Button>
            <Button variant="outline" size="lg" className="gap-3">
              <Upload className="w-5 h-5" />
              Upload Video
            </Button>
          </div>
        </div>

        {/* Right Column - 40% - How It Works */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-semibold text-white">How It Works</h3>
            
            <div className="space-y-5">
              {[
                { num: '1', title: 'Record', desc: 'Capture your workflow', icon: '🎥' },
                { num: '2', title: 'Upload', desc: 'Send to AI analysis', icon: '☁️' },
                { num: '3', title: 'Generate', desc: 'Get automation ready', icon: '⚡' },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xl">
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {step.title}
                    </h4>
                    <p className="text-sm text-white/60 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="#learn-more" className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-2">
              Learn more →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
