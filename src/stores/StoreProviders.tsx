import { BidPlannerStoreProvider } from "./bidPlanner/provider";
import { ConfigStoreProvider } from "./config/provider";
import { EventStoreProvider } from "./event/provider";
import { ModuleBankStoreProvider } from "./moduleBank/provider";
import { MultiplePlannerStoreProvider } from "./multiplePlanners/provider";
import { RecommendationStoreProvider } from "./recommendation/provider";
import { TimetableStoreProvider } from "./timetable/provider";

export default function StoreProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigStoreProvider>
      <MultiplePlannerStoreProvider>
        <ModuleBankStoreProvider>
          <TimetableStoreProvider>
            <EventStoreProvider>
              <BidPlannerStoreProvider>
                <RecommendationStoreProvider>
                  {children}
                </RecommendationStoreProvider>
              </BidPlannerStoreProvider>
            </EventStoreProvider>
          </TimetableStoreProvider>
        </ModuleBankStoreProvider>
      </MultiplePlannerStoreProvider>
    </ConfigStoreProvider>
  );
}
