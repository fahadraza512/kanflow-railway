import { Rocket, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GetStartedStepProps {
    workspaceName: string;
    selectedPlan: string;
    isCreatingWorkspace: boolean;
    onGetStarted: () => void;
    onBack: () => void;
}

export default function GetStartedStep({
    workspaceName,
    selectedPlan,
    isCreatingWorkspace,
    onGetStarted,
    onBack
}: GetStartedStepProps) {
    return (
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                    <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                    You're All Set! 🎉
                </h2>
                
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                    Your workspace <span className="font-semibold text-blue-600">{workspaceName}</span> has been created with the <span className="font-semibold text-blue-600">{selectedPlan}</span> plan.
                </p>
            </div>

            {/* Success Features */}
            <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Workspace Created</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Your team workspace is ready to use
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Plan Selected</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            {selectedPlan} plan features are available
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Ready to Collaborate</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Start creating projects and managing tasks
                        </p>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200 mb-8">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">What's Next?</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        Create your first project
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        Set up boards and tasks
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        Add team members to collaborate
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <Button
                    onClick={onGetStarted}
                    disabled={isCreatingWorkspace}
                    variant="primary"
                    fullWidth
                    className="text-base font-bold py-3"
                >
                    Go to Dashboard
                    <Rocket className="w-5 h-5 ml-2" />
                </Button>

                <Button
                    onClick={onBack}
                    disabled={isCreatingWorkspace}
                    variant="outline"
                    fullWidth
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Plans
                </Button>
            </div>
        </div>
    );
}
