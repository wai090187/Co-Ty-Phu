import React from 'react';
import { GameModalsProps } from '../types/modals';
import { PropertyModal } from '../../../components/Modals/PropertyModal';
import { StationAbilityModal } from '../../../components/Modals/StationAbilityModal';
import { UtilityAbilityModal } from '../../../components/Modals/UtilityAbilityModal';
import { CardModal } from '../../../components/Modals/CardModal';
import { InventoryModal } from '../../../components/Modals/InventoryModal';
import { SettingsModal } from '../../../components/Modals/SettingsModal';
import { CharacterSelectModal } from '../../../components/Modals/CharacterSelectModal';
import { TargetPlayerModal } from '../../../components/Modals/TargetPlayerModal';
import { PermanentTriggerModal } from '../../../components/Modals/PermanentTriggerModal';
import { AiActionModal } from '../../../components/Modals/AiActionModal';
import { GameOverModal } from '../../../components/Modals/GameOverModal';

export const GameModalsContainer: React.FC<GameModalsProps> = ({
  activePropertyModalTile,
  activePropertyOwner,
  currentRent,
  isLandingPropertyAction,
  hasMovedThisTurn,
  upgradesThisTurn,
  activePlayer,
  players,
  tiles,
  onBuyProperty,
  onBuildHouse,
  onMortgageProperty,
  onUnmortgageProperty,
  onClosePropertyModal,
  activeStationModal,
  offeredStationAbilities,
  consumableShop,
  onBuyConsumableAbility,
  onCloseStationModal,
  activeUtilityModal,
  offeredUtilityAbilities,
  permanentShop,
  onBuyPermanentAbility,
  onSellPermanentAbility,
  onCloseUtilityModal,
  activeDrawnCard,
  onExecuteDrawnCard,
  onCloseDrawnCard,
  showInventoryPlayerId,
  onUseConsumableAbility,
  onUseGetOutOfJailCard,
  onCloseInventory,
  canRoll,
  showSettings,
  settings,
  onUpdateSettings,
  chanceDeck,
  chestDeck,
  onUpdateCardQuantity,
  onAddCustomCard,
  onUpdateConsumableQuantity,
  onUpdatePermanentQuantity,
  onAddCustomConsumable,
  onAddCustomPermanent,
  onCloseSettings,
  pickingCharacterPlayerIdx,
  selectedCharacterId,
  onSelectCharacter,
  onCloseCharacterPicker,
  activeTargetAbility,
  availableTargets,
  onSelectTargetPlayer,
  onCancelTargetSelection,
  activeAbilityNotification,
  onDismissAbilityNotification,
  aiActionModalInfo,
  onDismissAiActionModal,
  winner,
  onRestartGame,
}) => {
  return (
    <>
      {/* 1. Property Deed Modal */}
      {activePropertyModalTile && (
        <PropertyModal
          tile={activePropertyModalTile}
          owner={activePropertyOwner}
          activePlayer={activePlayer!}
          onBuy={() => onBuyProperty(activePropertyModalTile)}
          onBuildHouse={() => {
            const res = onBuildHouse(activePropertyModalTile);
            if (!res.success && res.message) {
              alert(res.message);
            }
          }}
          onBuildHouseWithAbility={(abilityId: string) => {
            const res = onBuildHouse(activePropertyModalTile, abilityId);
            if (!res.success && res.message) {
              alert(res.message);
            }
          }}
          onMortgage={() => onMortgageProperty(activePropertyModalTile)}
          onUnmortgage={() => onUnmortgageProperty(activePropertyModalTile)}
          onPayRent={onClosePropertyModal}
          onClose={onClosePropertyModal}
          rentAmount={currentRent}
          isLandingAction={isLandingPropertyAction}
          hasMovedThisTurn={hasMovedThisTurn}
          upgradesThisTurn={upgradesThisTurn}
        />
      )}

      {/* 2. Station Ability Shop */}
      {activeStationModal && (
        <StationAbilityModal
          tile={activeStationModal}
          player={activePlayer!}
          abilities={offeredStationAbilities.length > 0 ? offeredStationAbilities : consumableShop}
          onBuyAbility={onBuyConsumableAbility}
          onClose={onCloseStationModal}
          hasVipDiscount={activePlayer?.permanentAbilities.includes('perm-station-vip')}
        />
      )}

      {/* 3. Utility Ability Shop */}
      {activeUtilityModal && (
        <UtilityAbilityModal
          tile={activeUtilityModal}
          player={activePlayer!}
          abilities={offeredUtilityAbilities.length > 0 ? offeredUtilityAbilities : permanentShop}
          allPermanents={permanentShop}
          onBuyAbility={onBuyPermanentAbility}
          onSellAbility={onSellPermanentAbility}
          onClose={onCloseUtilityModal}
        />
      )}

      {/* 4. Drawn Card Modal */}
      {activeDrawnCard && (
        <CardModal
          card={activeDrawnCard}
          onExecute={() => onExecuteDrawnCard(activeDrawnCard)}
          onClose={onCloseDrawnCard}
          isActionable={true}
        />
      )}

      {/* 5. Inventory Modal */}
      {showInventoryPlayerId && (
        <InventoryModal
          player={players.find(p => p.id === showInventoryPlayerId)!}
          allConsumables={consumableShop}
          allPermanents={permanentShop}
          tiles={tiles}
          onUseAbility={onUseConsumableAbility}
          onUseGetOutOfJailCard={onUseGetOutOfJailCard}
          onClose={onCloseInventory}
          isCurrentTurn={showInventoryPlayerId === activePlayer?.id}
          canUseDiceModifiers={canRoll}
        />
      )}

      {/* 6. Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          chanceDeck={chanceDeck}
          chestDeck={chestDeck}
          onUpdateCardQuantity={onUpdateCardQuantity}
          onAddCustomCard={onAddCustomCard}
          consumableShop={consumableShop}
          permanentShop={permanentShop}
          onUpdateConsumableQuantity={onUpdateConsumableQuantity}
          onUpdatePermanentQuantity={onUpdatePermanentQuantity}
          onAddCustomConsumable={onAddCustomConsumable}
          onAddCustomPermanent={onAddCustomPermanent}
          onClose={onCloseSettings}
        />
      )}

      {/* 7. Character Selection Modal */}
      {pickingCharacterPlayerIdx !== null && (
        <CharacterSelectModal
          selectedCharacterId={selectedCharacterId || 'cong-tu'}
          onSelect={onSelectCharacter}
          onClose={onCloseCharacterPicker}
          playerName={`Vị trí #${pickingCharacterPlayerIdx + 1}`}
        />
      )}

      {/* 8. Target Player Modal */}
      {activeTargetAbility && (
        <TargetPlayerModal
          ability={activeTargetAbility}
          activePlayer={activePlayer!}
          availableTargets={availableTargets}
          onSelectTarget={onSelectTargetPlayer}
          onCancel={onCancelTargetSelection}
        />
      )}

      {/* 9. Permanent Trigger Notification Modal */}
      {activeAbilityNotification && (
        <PermanentTriggerModal
          notification={activeAbilityNotification}
          onDismiss={onDismissAbilityNotification}
        />
      )}

      {/* 10. AI Action Modal */}
      {aiActionModalInfo && (
        <AiActionModal
          aiPlayer={aiActionModalInfo.aiPlayer}
          title={aiActionModalInfo.title}
          message={aiActionModalInfo.message}
          type={aiActionModalInfo.type}
          onDismiss={onDismissAiActionModal}
        />
      )}

      {/* 11. Game Over Modal */}
      {winner && (
        <GameOverModal winner={winner} tiles={tiles} onRestart={onRestartGame} />
      )}
    </>
  );
};
